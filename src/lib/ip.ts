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

function assertValidIp(ip: string): void {
	if (isIP(ip) === 0) {
		throw new Error('Invalid IP address');
	}
}

export async function getIpDetails(ip: string): Promise<IpDetails> {
	assertValidIp(ip);
	const requestUrl = new URL(`http://ip-api.com/json/${encodeURIComponent(ip)}`);

	const [response, reverse] = await Promise.all([
		fetch(requestUrl, {
			next: { revalidate: 86_400 },
		}),
		getReverseDns(ip),
	]);

	if (!response.ok) {
		throw new Error(`IP lookup failed: ${response.statusText}`);
	}

	const json = (await response.json()) as Record<string, unknown>;
	delete json.status;
	return { ...(json as unknown as IpDetails), reverse };
}

export function normalizeIpForCache(ip: string): string {
	return ip.replace(/\.[0-9]+$/, '.0').replace(/:([0-9a-fA-F]+)$/, ':');
}

const detailsLoader = new DataLoader<string, IpDetails>(
	async ips =>
		Promise.all(
			ips.map(async ip => {
				const normal = normalizeIpForCache(ip);
				return getIpDetails(normal);
			}),
		),
	{ cacheKeyFn: normalizeIpForCache },
);

export async function getIpOrg(ip: string): Promise<string | null> {
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
