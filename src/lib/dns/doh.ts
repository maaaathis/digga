import { isValidLookupDomain } from '@/lib/domain-core';

import { formatCaaData } from './caa';
import {
	type DnsLookup,
	type DoHResponse,
	dohAnswerFailure,
	EMPTY_RECORDS,
	type RawRecord,
	RECORD_TYPE_BY_DECIMAL,
	RECORD_TYPES,
	type RecordFailures,
	type RecordType,
	type ResolvedRecords,
	type ResolverId,
	RESOLVERS,
} from './types';

type FetchOptions = {
	signal?: AbortSignal;
	fetchInit?: RequestInit;
};

function resolverConfig(resolver: ResolverId) {
	const found = RESOLVERS.find(r => r.id === resolver);
	if (!found) throw new Error(`Unknown resolver: ${resolver}`);
	return found;
}

type TypeResult = { records: RawRecord[]; error: string | null };

/**
 * Resolves one record type and says whether the empty case is a real empty
 * RRset or a failed lookup (network, HTTP or DNS level). Abort errors rethrow.
 */
export async function queryRecordType(
	resolver: ResolverId,
	domain: string,
	type: RecordType,
	options: FetchOptions = {},
): Promise<TypeResult> {
	if (!isValidLookupDomain(domain)) return { records: [], error: null };

	const config = resolverConfig(resolver);
	const url = `${config.endpoint}?name=${encodeURIComponent(domain)}&type=${type}`;

	let json: DoHResponse;
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: config.accept,
			},
			signal: options.signal,
			...options.fetchInit,
		});
		if (!response.ok) {
			console.warn(`DoH ${resolver} returned ${response.status} for ${domain} ${type}`);
			return { records: [], error: `HTTP ${response.status}` };
		}
		json = (await response.json()) as DoHResponse;
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') throw error;
		console.warn(`DoH ${resolver} fetch failed for ${domain} ${type}:`, error);
		return { records: [], error: 'No response' };
	}

	const failure = dohAnswerFailure(json);
	if (failure) return { records: [], error: failure };
	if (!json.Answer) return { records: [], error: null };

	const records = json.Answer.filter(
		answer => answer.type in RECORD_TYPE_BY_DECIMAL && RECORD_TYPE_BY_DECIMAL[answer.type] === type,
	).map(answer => {
		const base = { name: answer.name, type, TTL: answer.TTL };

		if (type === 'CAA') {
			const formatted = formatCaaData(answer.data);
			if (formatted !== answer.data) {
				return { ...base, data: formatted, raw: answer.data };
			}
		}

		return { ...base, data: answer.data };
	});

	return { records, error: null };
}

/** Records for one type; a failed lookup reads as empty. Use queryRecordType to tell them apart. */
export async function resolveRecordType(
	resolver: ResolverId,
	domain: string,
	type: RecordType,
	options: FetchOptions = {},
): Promise<RawRecord[]> {
	return (await queryRecordType(resolver, domain, type, options)).records;
}

export async function resolveAllRecords(
	resolver: ResolverId,
	domain: string,
	options: FetchOptions = {},
): Promise<DnsLookup> {
	if (!isValidLookupDomain(domain)) return { records: EMPTY_RECORDS, failures: {} };

	const results = await Promise.all(
		RECORD_TYPES.map(type => queryRecordType(resolver, domain, type, options)),
	);

	const records = {} as ResolvedRecords;
	const failures: RecordFailures = {};
	RECORD_TYPES.forEach((type, index) => {
		records[type] = results[index].records;
		const error = results[index].error;
		if (error) failures[type] = error;
	});

	return { records, failures };
}

export function hasAnyRecords(records: ResolvedRecords): boolean {
	return RECORD_TYPES.some(type => records[type].length > 0);
}
