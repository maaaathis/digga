import { isValidLookupDomain } from '@/lib/domain';

import { type DoHResponse, RECORD_TYPE_BY_DECIMAL, type RecordType } from './types';

export type PropagationResolver = {
	id: string;
	label: string;
	region: string;
	endpoint: string;
	accept: string;
};

export const PROPAGATION_RESOLVERS: PropagationResolver[] = [
	{
		id: 'cloudflare',
		label: 'Cloudflare',
		region: 'Global anycast',
		endpoint: 'https://cloudflare-dns.com/dns-query',
		accept: 'application/dns-json',
	},
	{
		id: 'google',
		label: 'Google',
		region: 'Global anycast',
		endpoint: 'https://dns.google/resolve',
		accept: 'application/json',
	},
	{
		id: 'alibaba',
		label: 'Alibaba',
		region: 'China',
		endpoint: 'https://dns.alidns.com/resolve',
		accept: 'application/json',
	},
	{
		id: 'dnssb',
		label: 'DNS.SB',
		region: 'Global anycast',
		endpoint: 'https://doh.dns.sb/dns-query',
		accept: 'application/dns-json',
	},
];

export const PROPAGATION_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'] as const;
export type PropagationType = (typeof PROPAGATION_TYPES)[number];

export type ResolverOutcome = {
	id: string;
	label: string;
	region: string;
	status: 'ok' | 'error';
	/** Sorted record values exactly as the resolver returned them (kept for display). */
	values: string[];
	/** Normalized, order-independent key used to compare resolvers (see normalizeForCompare). */
	matchKey: string;
	/** Smallest TTL across the answers, or null when there are none. */
	ttl: number | null;
};

export type PropagationReport = {
	type: RecordType;
	outcomes: ResolverOutcome[];
	/** Raw values of a representative majority responder (for the banner). */
	consensus: string[] | null;
	/** matchKey shared by the majority; outcomes with this key are in agreement. */
	consensusKey: string | null;
	agree: number;
	responders: number;
	propagated: boolean;
};

/**
 * Build an order-independent comparison key. TXT records are quoted by most
 * resolvers ("v=spf1 ...") but returned bare by Google, and long records may be
 * split into several quoted chunks. Stripping quotes lets equal records match
 * regardless of that formatting, while the raw values are still shown as-is.
 */
function normalizeForCompare(type: RecordType, values: string[]): string {
	const normalized = type === 'TXT' ? values.map(value => value.replace(/"/g, '').trim()) : values;
	return JSON.stringify([...normalized].sort());
}

async function queryResolver(
	resolver: PropagationResolver,
	domain: string,
	type: RecordType,
	signal?: AbortSignal,
): Promise<ResolverOutcome> {
	const base = { id: resolver.id, label: resolver.label, region: resolver.region };
	try {
		const url = `${resolver.endpoint}?name=${encodeURIComponent(domain)}&type=${type}`;
		const response = await fetch(url, { headers: { Accept: resolver.accept }, signal });
		if (!response.ok) {
			return { ...base, status: 'error', values: [], matchKey: '', ttl: null };
		}

		const json = (await response.json()) as DoHResponse;
		const answers = (json.Answer ?? []).filter(
			answer => RECORD_TYPE_BY_DECIMAL[answer.type] === type,
		);
		const values = answers.map(answer => answer.data).sort();
		const ttl = answers.length > 0 ? Math.min(...answers.map(answer => answer.TTL)) : null;
		return { ...base, status: 'ok', values, matchKey: normalizeForCompare(type, values), ttl };
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') throw error;
		return { ...base, status: 'error', values: [], matchKey: '', ttl: null };
	}
}

export async function checkPropagation(
	domain: string,
	type: RecordType,
	signal?: AbortSignal,
): Promise<PropagationReport> {
	if (!isValidLookupDomain(domain)) {
		return {
			type,
			outcomes: [],
			consensus: null,
			consensusKey: null,
			agree: 0,
			responders: 0,
			propagated: false,
		};
	}

	const outcomes = await Promise.all(
		PROPAGATION_RESOLVERS.map(resolver => queryResolver(resolver, domain, type, signal)),
	);

	const responders = outcomes.filter(outcome => outcome.status === 'ok');
	const tally = new Map<string, number>();
	for (const outcome of responders) {
		tally.set(outcome.matchKey, (tally.get(outcome.matchKey) ?? 0) + 1);
	}

	let consensusKey: string | null = null;
	let agree = 0;
	for (const [key, count] of tally) {
		if (count > agree) {
			agree = count;
			consensusKey = key;
		}
	}

	const representative = responders.find(outcome => outcome.matchKey === consensusKey);

	return {
		type,
		outcomes,
		consensus: representative ? representative.values : null,
		consensusKey,
		agree,
		responders: responders.length,
		propagated: responders.length > 0 && tally.size === 1,
	};
}
