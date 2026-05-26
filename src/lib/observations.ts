import 'server-only';

import { bigquery } from '@/lib/bigquery';
import { getBaseDomain, getTLD, isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import type { RawRecord, ResolvedRecords, ResolverId } from '@/lib/dns/types';

type ObservationRow = {
	observed_at: string;
	domain: string;
	base_domain: string;
	public_suffix: string | null;
	record_type: string;
	value: string;
	ttl: number | null;
	priority: number | null;
	resolver: string | null;
};

function normalizeValue(type: string, raw: string): string {
	const trimmed = raw.trim();
	if (type === 'TXT') return trimmed;
	return trimmed.replace(/\.$/, '').toLowerCase();
}

function parseMxLike(type: string, raw: string): { value: string; priority: number | null } {
	if (type !== 'MX' && type !== 'SRV') {
		return { value: normalizeValue(type, raw), priority: null };
	}
	const trimmed = raw.trim();
	const match = /^(\d+)\s/.exec(trimmed);
	if (!match) {
		return { value: normalizeValue(type, raw), priority: null };
	}
	return {
		value: normalizeValue(type, trimmed.slice(match[0].length)),
		priority: Number.parseInt(match[1], 10),
	};
}

function buildRow(
	base: {
		domain: string;
		baseDomain: string;
		publicSuffix: string | null;
		resolver: ResolverId | null;
		observedAt: string;
	},
	record: RawRecord,
): ObservationRow {
	const { value, priority } = parseMxLike(record.type, record.data);
	return {
		observed_at: base.observedAt,
		domain: base.domain,
		base_domain: base.baseDomain,
		public_suffix: base.publicSuffix,
		record_type: record.type,
		value,
		ttl: typeof record.TTL === 'number' ? record.TTL : null,
		priority,
		resolver: base.resolver,
	};
}

export type RecordSetInput = {
	type: string;
	records: RawRecord[];
};

export async function persistObservations(args: {
	domain: string;
	resolver?: ResolverId | null;
	recordSets: RecordSetInput[];
}): Promise<void> {
	if (!bigquery || !process.env.BIGQUERY_DATASET) return;

	const domain = normalizeDomain(args.domain);
	if (!isValidLookupDomain(domain)) return;

	const baseDomain = getBaseDomain(domain);
	if (!baseDomain) return;

	const observedAt = new Date().toISOString();
	const publicSuffix = getTLD(domain);

	const rows: ObservationRow[] = [];
	for (const set of args.recordSets) {
		for (const record of set.records) {
			if (!record?.data) continue;
			rows.push(
				buildRow(
					{
						domain,
						baseDomain,
						publicSuffix,
						resolver: args.resolver ?? null,
						observedAt,
					},
					record,
				),
			);
		}
	}

	if (rows.length === 0) return;

	try {
		await bigquery.insertRows({
			datasetName: process.env.BIGQUERY_DATASET,
			tableName: 'dns_observations',
			rows,
		});
	} catch (error) {
		if (error && typeof error === 'object' && 'errors' in error) {
			for (const err of (error as { errors: unknown[] }).errors) {
				console.error('dns_observations insert error:', err);
			}
		} else {
			console.error('dns_observations insert error:', error);
		}
	}
}

export async function persistObservationsFromMap(args: {
	domain: string;
	resolver?: ResolverId | null;
	records: Partial<ResolvedRecords>;
}): Promise<void> {
	const recordSets: RecordSetInput[] = [];
	for (const [type, records] of Object.entries(args.records)) {
		if (!records || records.length === 0) continue;
		recordSets.push({ type, records });
	}
	if (recordSets.length === 0) return;
	await persistObservations({
		domain: args.domain,
		resolver: args.resolver,
		recordSets,
	});
}
