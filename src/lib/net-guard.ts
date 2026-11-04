import 'server-only';

import { lookup } from 'node:dns/promises';
import https from 'node:https';
import { BlockList, isIP } from 'node:net';

// Guards outbound connections to hosts that come from user input (a looked up
// domain). Without it, a domain whose A/AAAA records point at 127.0.0.1,
// 10.0.0.0/8 or 169.254.169.254 makes this server connect to its own network.
// Every caller resolves first, checks each address, and then connects to the
// checked address directly so a second DNS answer cannot swap it out.

const BLOCKED_IPV4: [string, number][] = [
	['0.0.0.0', 8], // "this network"
	['10.0.0.0', 8], // RFC 1918
	['100.64.0.0', 10], // carrier grade NAT
	['127.0.0.0', 8], // loopback
	['169.254.0.0', 16], // link local, cloud metadata endpoints
	['172.16.0.0', 12], // RFC 1918
	['192.0.0.0', 24], // IETF protocol assignments
	['192.0.2.0', 24], // TEST-NET-1
	['192.88.99.0', 24], // 6to4 relay anycast
	['192.168.0.0', 16], // RFC 1918
	['198.18.0.0', 15], // benchmarking
	['198.51.100.0', 24], // TEST-NET-2
	['203.0.113.0', 24], // TEST-NET-3
	['224.0.0.0', 4], // multicast
	['240.0.0.0', 4], // reserved, includes broadcast
];

// Only global unicast (2000::/3) is allowed for IPv6. These are the special
// purpose blocks inside it.
const BLOCKED_IPV6: [string, number][] = [
	['2001::', 23], // IETF protocol assignments, includes Teredo
	['2001:db8::', 32], // documentation
	['2002::', 16], // 6to4, embeds arbitrary IPv4 addresses
	['3fff::', 20], // documentation (RFC 9637)
];

const blocklist = new BlockList();
for (const [network, prefix] of BLOCKED_IPV4) blocklist.addSubnet(network, prefix, 'ipv4');
for (const [network, prefix] of BLOCKED_IPV6) blocklist.addSubnet(network, prefix, 'ipv6');

function expandIpv6(ip: string): number[] | null {
	let input = ip;
	const lastColon = input.lastIndexOf(':');
	const tail = input.slice(lastColon + 1);
	if (isIP(tail) === 4) {
		const [a, b, c, d] = tail.split('.').map(Number);
		input = `${input.slice(0, lastColon + 1)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
	}

	const halves = input.split('::');
	if (halves.length > 2) return null;
	const head = halves[0] ? halves[0].split(':') : [];
	const rest = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
	const missing = 8 - head.length - rest.length;
	if (halves.length === 1 ? missing !== 0 : missing < 1) return null;

	const hextets = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill('0'), ...rest];
	const parsed = hextets.map(part => Number.parseInt(part, 16));
	return parsed.every(value => Number.isInteger(value) && value >= 0 && value <= 0xffff)
		? parsed
		: null;
}

function embeddedIpv4(hextets: number[]): string | null {
	const zeroPrefix = hextets.slice(0, 5).every(value => value === 0);
	const mapped = zeroPrefix && hextets[5] === 0xffff; // ::ffff:a.b.c.d
	const nat64 =
		hextets[0] === 0x64 && hextets[1] === 0xff9b && hextets.slice(2, 6).every(value => value === 0); // 64:ff9b::a.b.c.d
	if (!mapped && !nat64) return null;
	return [hextets[6] >> 8, hextets[6] & 0xff, hextets[7] >> 8, hextets[7] & 0xff].join('.');
}

export function isPublicIp(ip: string): boolean {
	// Zone IDs (fe80::1%eth0) only exist for link local scopes.
	if (ip.includes('%')) return false;

	const version = isIP(ip);
	if (version === 4) return !blocklist.check(ip, 'ipv4');
	if (version !== 6) return false;

	const hextets = expandIpv6(ip);
	if (!hextets) return false;

	const embedded = embeddedIpv4(hextets);
	if (embedded) return isPublicIp(embedded);

	if ((hextets[0] & 0xe000) !== 0x2000) return false;
	return !blocklist.check(ip, 'ipv6');
}

export class BlockedAddressError extends Error {
	readonly code = 'ERR_BLOCKED_ADDRESS';

	constructor(host: string) {
		super(`${host} does not resolve to a public address`);
		this.name = 'BlockedAddressError';
	}
}

export type PublicAddress = { address: string; family: 4 | 6 };

function raceAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
	if (!signal) return promise;
	if (signal.aborted) return Promise.reject(signal.reason);
	return new Promise<T>((resolve, reject) => {
		const onAbort = () => reject(signal.reason);
		signal.addEventListener('abort', onAbort, { once: true });
		promise.then(
			value => {
				signal.removeEventListener('abort', onAbort);
				resolve(value);
			},
			error => {
				signal.removeEventListener('abort', onAbort);
				reject(error);
			},
		);
	});
}

/**
 * Resolves `host` and returns one public address to connect to. Private, local
 * and reserved addresses are dropped; if nothing public is left this throws a
 * BlockedAddressError. Resolver failures are rethrown as is (ENOTFOUND etc.).
 * IPv4 is preferred because serverless hosts often lack IPv6 egress.
 */
export async function resolvePublicAddress(
	host: string,
	options: { signal?: AbortSignal } = {},
): Promise<PublicAddress> {
	const literal = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
	const version = isIP(literal);
	if (version !== 0) {
		if (!isPublicIp(literal)) throw new BlockedAddressError(host);
		return { address: literal, family: version as 4 | 6 };
	}

	const addresses = await raceAbort(lookup(host, { all: true, verbatim: true }), options.signal);
	const usable = addresses
		.filter(entry => (entry.family === 4 || entry.family === 6) && isPublicIp(entry.address))
		.sort((a, b) => a.family - b.family);

	if (usable.length === 0) throw new BlockedAddressError(host);
	return { address: usable[0].address, family: usable[0].family as 4 | 6 };
}

export type PublicFetchResult = { status: number; body: string };

/**
 * GETs an https URL on a public address only. Redirects are never followed:
 * a 3xx comes back as its status so the caller decides (and a redirect cannot
 * point us at an internal host). The TLS certificate is verified against the
 * original hostname.
 */
export async function fetchPublicText(
	input: string,
	options: { signal?: AbortSignal; maxBytes?: number } = {},
): Promise<PublicFetchResult> {
	const url = new URL(input);
	if (url.protocol !== 'https:') throw new Error('Only https URLs are allowed');

	const target = await resolvePublicAddress(url.hostname, { signal: options.signal });
	const maxBytes = options.maxBytes ?? 64 * 1024;
	const hostname = url.hostname.replace(/^\[|\]$/g, '');

	return new Promise<PublicFetchResult>((resolve, reject) => {
		const request = https.request(
			{
				host: target.address,
				family: target.family,
				port: url.port ? Number(url.port) : 443,
				path: `${url.pathname}${url.search}`,
				method: 'GET',
				servername: isIP(hostname) === 0 ? hostname : undefined,
				headers: { Host: url.host, Accept: 'text/plain' },
				agent: false,
				signal: options.signal,
			},
			response => {
				const chunks: Buffer[] = [];
				let size = 0;
				response.on('data', (chunk: Buffer) => {
					size += chunk.length;
					if (size > maxBytes) {
						request.destroy(new Error('Response body too large'));
						return;
					}
					chunks.push(chunk);
				});
				response.on('end', () =>
					resolve({
						status: response.statusCode ?? 0,
						body: Buffer.concat(chunks).toString('utf8'),
					}),
				);
				response.on('error', reject);
			},
		);
		request.on('error', reject);
		request.end();
	});
}
