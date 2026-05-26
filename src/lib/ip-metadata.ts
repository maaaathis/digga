import 'server-only';

import { bigquery } from '@/lib/bigquery';
import { getIpDetails, type IpDetails } from '@/lib/ip';

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

type IpMetadataRow = {
	ip: string;
	ip_version: number;
	asn: string | null;
	asn_name: string | null;
	country_code: string | null;
	country_name: string | null;
	region_name: string | null;
	city: string | null;
	org: string | null;
	isp: string | null;
	reverse_ptr: string | null;
	updated_at: string;
};

function splitAsn(value: string | null | undefined): {
	asn: string | null;
	name: string | null;
} {
	if (!value) return { asn: null, name: null };
	const match = value.trim().match(/^(AS\d+)\s*(.*)$/i);
	if (!match) return { asn: null, name: value.trim() || null };
	return { asn: match[1].toUpperCase(), name: match[2].trim() || null };
}

function toRow(details: IpDetails): IpMetadataRow {
	const { asn, name } = splitAsn(details.as);
	return {
		ip: details.query,
		ip_version: IPV4.test(details.query) ? 4 : 6,
		asn,
		asn_name: name ?? details.org ?? null,
		country_code: details.countryCode || null,
		country_name: details.country || null,
		region_name: details.regionName || null,
		city: details.city || null,
		org: details.org || null,
		isp: details.isp || null,
		reverse_ptr: details.reverse,
		updated_at: new Date().toISOString(),
	};
}

export async function persistIpMetadata(ips: string[]): Promise<void> {
	if (!bigquery || !process.env.BIGQUERY_DATASET) return;
	if (ips.length === 0) return;

	const unique = Array.from(new Set(ips.filter(Boolean)));

	const rows: IpMetadataRow[] = [];
	for (const ip of unique) {
		try {
			const details = await getIpDetails(ip);
			rows.push(toRow(details));
		} catch (error) {
			console.warn('IP enrichment failed:', ip, error);
		}
	}

	if (rows.length === 0) return;

	try {
		await bigquery.insertRows({
			datasetName: process.env.BIGQUERY_DATASET,
			tableName: 'ip_metadata',
			rows,
		});
	} catch (error) {
		if (error && typeof error === 'object' && 'errors' in error) {
			for (const err of (error as { errors: unknown[] }).errors) {
				console.error('ip_metadata insert error:', err);
			}
		} else {
			console.error('ip_metadata insert error:', error);
		}
	}
}
