import 'server-only';

import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { isValidLookupDomain, normalizeDomain } from '@/lib/domain';

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RESULTS = 5_000;
const MAX_STDERR_BYTES = 64 * 1024;
const KILL_GRACE_MS = 2_000;
const MAX_CONCURRENT = Math.max(1, Number(process.env.SUBFINDER_MAX_CONCURRENT ?? 3));

// Global in-process gate. The single most important crash protection:
// no matter how many distinct IPs hit us, we never spawn more than
// MAX_CONCURRENT subfinder processes at once.
let activeScans = 0;

/**
 * Why a result list may be missing entries:
 * - `interrupted`: subfinder hit our deadline or exited with an error before
 *   every source finished. The list holds what was found up to that point.
 * - `limit`: MAX_RESULTS was reached and the scan was stopped early.
 */
export type SubfinderIncompleteReason = 'interrupted' | 'limit';

export type SubfinderResult =
	| { kind: 'ok'; subdomains: string[]; incomplete: SubfinderIncompleteReason | null }
	| { kind: 'unavailable'; reason: 'binary-missing' }
	| { kind: 'busy' }
	| { kind: 'timeout' }
	| { kind: 'error'; message: string };

let cachedBinaryPath: string | null = null;

function binaryPath(): string {
	if (process.env.SUBFINDER_BIN) return process.env.SUBFINDER_BIN;
	if (cachedBinaryPath) return cachedBinaryPath;

	// Binary downloaded by scripts/install-subfinder.sh during pnpm install.
	const bundled = join(process.cwd(), 'bin', 'subfinder');
	cachedBinaryPath = existsSync(bundled) ? bundled : 'subfinder';
	return cachedBinaryPath;
}

// Log levels subfinder prints in verbose mode. Any other `[tag] value` line
// on stderr is a live find, tagged with the source that produced it.
const LOG_TAGS = new Set(['INF', 'DBG', 'WRN', 'ERR', 'FTL', 'VER']);
const STDERR_FIND = /^\[([^\]]+)\] (\S+)$/;
const HOST_PATTERN = /^[a-z0-9_.-]+$/;

function buildArgs(domain: string): string[] {
	// -v instead of -silent: subfinder buffers its stdout list until the whole
	// enumeration is done, so a killed process prints nothing there. Verbose mode
	// streams every find to stderr as it arrives, which lets us keep partial
	// results on timeout. -duc skips the version check on every start.
	const args = ['-d', domain, '-nc', '-v', '-duc', '-timeout', '20'];
	// -all pulls every source (slower, more memory, more open sockets).
	// Off by default; opt in via env on a beefy host.
	if (process.env.SUBFINDER_ALL_SOURCES === 'true') args.push('-all');
	// Backstop inside subfinder itself (minutes) in case our timer is bypassed.
	args.push('-max-time', '1');
	return args;
}

function killTree(child: ChildProcess): void {
	const pid = child.pid;
	const sendGroup = (signal: NodeJS.Signals) => {
		try {
			if (pid) process.kill(-pid, signal);
			else child.kill(signal);
		} catch {
			try {
				child.kill(signal);
			} catch {}
		}
	};

	sendGroup('SIGTERM');
	const killTimer = setTimeout(() => sendGroup('SIGKILL'), KILL_GRACE_MS);
	killTimer.unref?.();
}

function execSubfinder(
	domain: string,
	options: { timeoutMs?: number; signal?: AbortSignal },
): Promise<SubfinderResult> {
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	return new Promise<SubfinderResult>(resolve => {
		let settled = false;
		const child = spawn(binaryPath(), buildArgs(domain), {
			stdio: ['ignore', 'pipe', 'pipe'],
			detached: true,
			// subfinder writes its config under $HOME/.config; ensure a writable
			// location on read-only container filesystems.
			env: { ...process.env, HOME: process.env.HOME || '/tmp' },
		});

		const settle = (result: SubfinderResult) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			killTree(child);
			resolve(result);
		};

		const collected = new Set<string>();
		const suffix = `.${domain}`;
		let errorBytes = 0;
		let errorBuffer = '';

		const finish = (incomplete: SubfinderIncompleteReason | null) =>
			settle({ kind: 'ok', subdomains: Array.from(collected), incomplete });

		const timer = setTimeout(() => {
			if (collected.size > 0) finish('interrupted');
			else settle({ kind: 'timeout' });
		}, timeoutMs);
		timer.unref?.();

		if (options.signal) {
			if (options.signal.aborted) {
				settle({ kind: 'error', message: 'Aborted' });
				return;
			}
			options.signal.addEventListener(
				'abort',
				() => settle({ kind: 'error', message: 'Aborted' }),
				{ once: true },
			);
		}

		const addHost = (value: string) => {
			if (settled) return;
			const host = value.trim().toLowerCase().replace(/^\*\./, '').replace(/\.$/, '');
			if (!HOST_PATTERN.test(host) || !(host === domain || host.endsWith(suffix))) return;
			collected.add(host);
			if (collected.size >= MAX_RESULTS) finish('limit');
		};

		// Chunks can end mid line, so keep the tail until the next chunk.
		const lineReader = (onLine: (line: string) => void) => {
			let pending = '';
			return {
				push(chunk: string) {
					pending += chunk;
					const lines = pending.split(/\r?\n/);
					pending = lines.pop() ?? '';
					for (const line of lines) onLine(line);
				},
				flush() {
					if (pending) onLine(pending);
					pending = '';
				},
			};
		};

		// Final list, printed once enumeration completes.
		const stdout = lineReader(addHost);

		// Live finds as `[source] host`, plus log lines we keep for errors.
		const stderr = lineReader(line => {
			const match = STDERR_FIND.exec(line);
			if (match && !LOG_TAGS.has(match[1])) {
				addHost(match[2]);
				return;
			}
			if (!/^\[(ERR|FTL)\]/.test(line) || errorBytes >= MAX_STDERR_BYTES) return;
			errorBytes += line.length + 1;
			errorBuffer += `${line}\n`;
		});

		child.stdout.setEncoding('utf8');
		child.stdout.on('data', (chunk: string) => stdout.push(chunk));

		child.stderr.setEncoding('utf8');
		child.stderr.on('data', (chunk: string) => stderr.push(chunk));

		child.on('error', (error: NodeJS.ErrnoException) => {
			if (error.code === 'ENOENT') {
				settle({ kind: 'unavailable', reason: 'binary-missing' });
				return;
			}
			if (collected.size > 0) finish('interrupted');
			else settle({ kind: 'error', message: error.message });
		});

		child.on('close', code => {
			stdout.flush();
			stderr.flush();
			if (code === 0) {
				finish(null);
			} else if (collected.size > 0) {
				finish('interrupted');
			} else {
				settle({
					kind: 'error',
					message: errorBuffer.trim() || `subfinder exited with code ${code}`,
				});
			}
		});
	});
}

export async function runSubfinder(
	domain: string,
	options: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<SubfinderResult> {
	const normalized = normalizeDomain(domain);
	if (!isValidLookupDomain(normalized)) {
		return { kind: 'error', message: 'Invalid domain' };
	}

	if (activeScans >= MAX_CONCURRENT) {
		return { kind: 'busy' };
	}

	activeScans += 1;
	try {
		return await execSubfinder(normalized, options);
	} finally {
		activeScans -= 1;
	}
}
