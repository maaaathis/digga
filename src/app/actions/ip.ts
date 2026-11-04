'use server';

import { headers } from 'next/headers';

import { inspectUserAgent } from '@/lib/bot';
import { getIpDetails, getIpsCountryMap, type IpCountry, type IpDetails } from '@/lib/ip';
import { consumeToken, ipFromHeaders, sweepBuckets } from '@/lib/rate-limit';

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6 = /^[0-9a-fA-F:]+$/;

export type IpDetailsResult =
	| { kind: 'ok'; details: IpDetails }
	| { kind: 'forbidden' }
	| { kind: 'rate-limited' }
	| { kind: 'invalid' }
	| { kind: 'error'; message: string };

export async function fetchIpDetails(ip: string): Promise<IpDetailsResult> {
	if (!ip || (!IPV4.test(ip) && !IPV6.test(ip))) {
		return { kind: 'invalid' };
	}

	const headerStore = await headers();
	const userAgent = headerStore.get('user-agent');
	const inspection = inspectUserAgent(userAgent);
	if (inspection.isBot && !inspection.isAllowed) {
		return { kind: 'forbidden' };
	}

	sweepBuckets();
	const requester = ipFromHeaders(headerStore);
	const limit = consumeToken(`ip:${requester}`, {
		capacity: 30,
		refillPerSecond: 1,
	});
	if (!limit.allowed) {
		return { kind: 'rate-limited' };
	}

	try {
		const details = await getIpDetails(ip);
		return { kind: 'ok', details };
	} catch (error) {
		return {
			kind: 'error',
			message: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

const MAX_COUNTRY_BATCH = 32;

/** Country per IP for inline flags. Uses the same cached lookups as the details modal. */
export async function fetchIpCountries(ips: string[]): Promise<Record<string, IpCountry>> {
	const valid = Array.from(new Set(ips.filter(ip => ip && (IPV4.test(ip) || IPV6.test(ip))))).slice(
		0,
		MAX_COUNTRY_BATCH,
	);
	if (valid.length === 0) return {};

	const headerStore = await headers();
	const inspection = inspectUserAgent(headerStore.get('user-agent'));
	if (inspection.isBot && !inspection.isAllowed) return {};

	sweepBuckets();
	const limit = consumeToken(`ip-countries:${ipFromHeaders(headerStore)}`, {
		capacity: 10,
		refillPerSecond: 0.2,
	});
	if (!limit.allowed) return {};

	return getIpsCountryMap(valid);
}
