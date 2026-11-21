import 'server-only';

import { promises as dnsPromises } from 'node:dns';
import { isIP } from 'node:net';

import DataLoader from 'dataloader';

export type IpDetails = {
	query: string;
	country: string;
	countryCode: string;
	region: string;
	regionName: string;
	city: string;
	zip: string;
	lat: number;
	lon: number;
	timezone: string;
	isp: string;
	org: string;
	as: string;
	reverse: string | null;
};

export async function getReverseDns(ip: string): Promise<string | null> {
	try {
		const hostnames = await dnsPromises.reverse(ip);
		if (Array.isArray(hostnames) && hostnames.length > 0) {
			return hostnames[0];
		}
		return null;
	} catch {
		return null;
	}
}

/** ip-api answered with `status: "fail"` (private, reserved or invalid address). Permanent for that IP. */
export class IpLookupUnavailableError extends Error {
	constructor(readonly reason: string) {
		super(`IP lookup unavailable: ${reason}`);
		this.name = 'IpLookupUnavailableError';
	}
}

function assertValidIp(ip: string): void {
	if (isIP(ip) === 0) {
		throw new Error('Invalid IP address');
	}
}

async function fetchIpApi(ip: string): Promise<Omit<IpDetails, 'reverse'>> {
	assertValidIp(ip);
	const requestUrl = new URL(`http://ip-api.com/json/${encodeURIComponent(ip)}`);

	// A 200 with status "fail" only happens for private, reserved or invalid addresses, so caching it is fine.
	// Rate limits arrive as HTTP 429 and are never cached.
	const response = await fetch(requestUrl, { next: { revalidate: 86_400 } });
	if (!response.ok) {
		throw new Error(`IP lookup failed: ${response.status} ${response.statusText}`);
	}

	const { status, message, ...rest } = (await response.json()) as Record<string, unknown>;
	if (status !== 'success') {
		throw new IpLookupUnavailableError(typeof message === 'string' ? message : 'unknown');
	}
	return rest as unknown as Omit<IpDetails, 'reverse'>;
}

export async function getIpDetails(ip: string): Promise<IpDetails> {
	const [details, reverse] = await Promise.all([fetchIpApi(ip), getReverseDns(ip)]);
	return { ...details, reverse };
}

export function normalizeIpForCache(ip: string): string {
	if (isIP(ip) === 4) return ip.replace(/\.\d+$/, '.0');
	if (isIP(ip) === 6) return ip.replace(/:[0-9a-fA-F]+$/, ':0');
	return ip;
}

const MAX_CACHED_IPS = 2_000;

function boundedCacheMap<K, V>(limit: number) {
	const entries = new Map<K, V>();
	return {
		get: (key: K) => entries.get(key),
		set: (key: K, value: V) => {
			if (entries.size >= limit) {
				const oldest = entries.keys().next();
				if (!oldest.done) entries.delete(oldest.value);
			}
			entries.set(key, value);
		},
		delete: (key: K) => {
			entries.delete(key);
		},
		clear: () => {
			entries.clear();
		},
	};
}

// Org and country only, so no reverse DNS (the key is the normalized address anyway).
const detailsLoader = new DataLoader<string, Omit<IpDetails, 'reverse'>>(
	async ips =>
		Promise.all(
			ips.map(ip =>
				fetchIpApi(normalizeIpForCache(ip)).catch((error: unknown) => {
					// DataLoader caches rejections too; forget transient failures so the next request retries.
					if (!(error instanceof IpLookupUnavailableError)) detailsLoader.clear(ip);
					return error instanceof Error ? error : new Error(String(error));
				}),
			),
		),
	{
		cacheKeyFn: normalizeIpForCache,
		cacheMap: boundedCacheMap<string, Promise<Omit<IpDetails, 'reverse'>>>(MAX_CACHED_IPS),
	},
);

export async function getIpOrg(ip: string): Promise<string | null> {
	if (isIP(ip) === 0) return null;
	try {
		const details = await detailsLoader.load(ip);
		if (details.org && details.org === details.isp) return details.org;
		if (details.org || details.isp) {
			return [details.org, details.isp].filter(Boolean).join(' / ');
		}
		return null;
	} catch (error) {
		console.warn('IP org lookup failed:', error);
		return null;
	}
}

export async function getIpsOrgMap(ips: string[]): Promise<Record<string, string>> {
	const entries = await Promise.all(ips.map(async ip => [ip, await getIpOrg(ip)] as const));
	return Object.fromEntries(
		entries.filter((entry): entry is readonly [string, string] => entry[1] !== null),
	);
}

export type IpCountry = { code: string; name: string };

export async function getIpCountry(ip: string): Promise<IpCountry | null> {
	if (isIP(ip) === 0) return null;
	try {
		const details = await detailsLoader.load(ip);
		if (!details.countryCode) return null;
		return { code: details.countryCode, name: details.country || details.countryCode };
	} catch (error) {
		console.warn('IP country lookup failed:', error);
		return null;
	}
}

export async function getIpsCountryMap(ips: string[]): Promise<Record<string, IpCountry>> {
	const unique = Array.from(new Set(ips));
	const entries = await Promise.all(unique.map(async ip => [ip, await getIpCountry(ip)] as const));
	return Object.fromEntries(
		entries.filter((entry): entry is readonly [string, IpCountry] => entry[1] !== null),
	);
}
