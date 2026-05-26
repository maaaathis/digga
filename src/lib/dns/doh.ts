import { isValidLookupDomain } from '@/lib/domain';

import {
	type DoHResponse,
	EMPTY_RECORDS,
	type RawRecord,
	RECORD_TYPE_BY_DECIMAL,
	RECORD_TYPES,
	type RecordType,
	type ResolvedRecords,
	type ResolverId,
	RESOLVERS,
} from './types';

type FetchOptions = {
	signal?: AbortSignal;
	fetchInit?: RequestInit;
};

function endpointFor(resolver: ResolverId): string {
	const found = RESOLVERS.find(r => r.id === resolver);
	if (!found) throw new Error(`Unknown resolver: ${resolver}`);
	return found.endpoint;
}

export async function resolveRecordType(
	resolver: ResolverId,
	domain: string,
	type: RecordType,
	options: FetchOptions = {},
): Promise<RawRecord[]> {
	if (!isValidLookupDomain(domain)) return [];

	const url = `${endpointFor(resolver)}?name=${encodeURIComponent(domain)}&type=${type}`;

	let response: Response;
	try {
		response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: resolver === 'cloudflare' ? 'application/dns-json' : 'application/json',
			},
			signal: options.signal,
			...options.fetchInit,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') throw error;
		console.warn(`DoH ${resolver} fetch failed for ${domain} ${type}:`, error);
		return [];
	}

	if (!response.ok) {
		console.warn(`DoH ${resolver} returned ${response.status} for ${domain} ${type}`);
		return [];
	}

	const json = (await response.json()) as DoHResponse;
	if (!json.Answer) return [];

	return json.Answer.filter(
		answer => answer.type in RECORD_TYPE_BY_DECIMAL && RECORD_TYPE_BY_DECIMAL[answer.type] === type,
	).map(answer => ({
		name: answer.name,
		type,
		TTL: answer.TTL,
		data: answer.data,
	}));
}

export async function resolveAllRecords(
	resolver: ResolverId,
	domain: string,
	options: FetchOptions = {},
): Promise<ResolvedRecords> {
	if (!isValidLookupDomain(domain)) return EMPTY_RECORDS;

	const results = await Promise.all(
		RECORD_TYPES.map(type => resolveRecordType(resolver, domain, type, options)),
	);

	return RECORD_TYPES.reduce((acc, type, index) => {
		acc[type] = results[index];
		return acc;
	}, {} as ResolvedRecords);
}

export function hasAnyRecords(records: ResolvedRecords): boolean {
	return RECORD_TYPES.some(type => records[type].length > 0);
}
