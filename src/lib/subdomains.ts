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

export type SubfinderResult =
	| { kind: 'ok'; subdomains: string[] }
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

function buildArgs(domain: string): string[] {
	const args = ['-d', domain, '-silent', '-nc', '-timeout', '20'];
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

		const timer = setTimeout(() => settle({ kind: 'timeout' }), timeoutMs);
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

		const collected = new Set<string>();
		let stderrBytes = 0;
		let stderrBuffer = '';

		child.stdout.setEncoding('utf8');
		child.stdout.on('data', (chunk: string) => {
			for (const line of chunk.split(/\r?\n/)) {
				const trimmed = line.trim().toLowerCase();
				if (!trimmed) continue;
				collected.add(trimmed);
				if (collected.size >= MAX_RESULTS) {
					settle({ kind: 'ok', subdomains: Array.from(collected) });
					return;
				}
			}
		});

		child.stderr.setEncoding('utf8');
		child.stderr.on('data', (chunk: string) => {
			if (stderrBytes >= MAX_STDERR_BYTES) return;
			stderrBytes += chunk.length;
			stderrBuffer += chunk;
		});

		child.on('error', (error: NodeJS.ErrnoException) => {
			if (error.code === 'ENOENT') {
				settle({ kind: 'unavailable', reason: 'binary-missing' });
				return;
			}
			settle({ kind: 'error', message: error.message });
		});

		child.on('close', code => {
			if (code === 0 || collected.size > 0) {
				settle({ kind: 'ok', subdomains: Array.from(collected) });
			} else {
				settle({
					kind: 'error',
					message: stderrBuffer.trim() || `subfinder exited with code ${code}`,
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
