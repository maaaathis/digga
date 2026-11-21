export const RECORD_TYPES = [
	'A',
	'AAAA',
	'CAA',
	'CNAME',
	'DNSKEY',
	'DS',
	'MX',
	'NAPTR',
	'NS',
	'PTR',
	'SOA',
	'SRV',
	'TXT',
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];

export const RECORD_TYPE_BY_DECIMAL: Record<number, RecordType> = {
	1: 'A',
	2: 'NS',
	5: 'CNAME',
	6: 'SOA',
	12: 'PTR',
	15: 'MX',
	16: 'TXT',
	28: 'AAAA',
	33: 'SRV',
	35: 'NAPTR',
	43: 'DS',
	48: 'DNSKEY',
	257: 'CAA',
};

export type DoHResponse = {
	Status: number;
	TC: boolean;
	RD: boolean;
	RA: boolean;
	AD: boolean;
	CD: boolean;
	Question: { name: string; type: number }[];
	Answer?: { name: string; type: number; TTL: number; data: string }[];
	Authority?: { name: string; type: number; TTL: number; data: string }[];
};

export type RawRecord = {
	name: string;
	type: RecordType;
	TTL: number;
	data: string;
	raw?: string;
};

export type ResolvedRecords = Record<RecordType, RawRecord[]>;

export const EMPTY_RECORDS: ResolvedRecords = RECORD_TYPES.reduce((acc, type) => {
	acc[type] = [];
	return acc;
}, {} as ResolvedRecords);

/** Why a record type could not be resolved, keyed by type. Missing types resolved fine. */
export type RecordFailures = Partial<Record<RecordType, string>>;

export type DnsLookup = {
	records: ResolvedRecords;
	failures: RecordFailures;
};

const RCODE_NAMES: Record<number, string> = {
	1: 'FORMERR',
	2: 'SERVFAIL',
	4: 'NOTIMP',
	5: 'REFUSED',
};

/**
 * Returns why a DoH JSON answer cannot be trusted as a real (possibly empty)
 * RRset, or null when it can. NOERROR and NXDOMAIN are real answers; any other
 * RCODE, or a truncated reply without answers, means the resolver did not know.
 */
export function dohAnswerFailure(json: DoHResponse): string | null {
	if (json.Status !== 0 && json.Status !== 3) {
		return RCODE_NAMES[json.Status] ?? `RCODE ${json.Status}`;
	}
	if (json.TC && !json.Answer?.length) return 'Truncated response';
	return null;
}

export type ResolverId = 'cloudflare' | 'google' | 'alibaba' | 'dnssb';

export const RESOLVERS: { id: ResolverId; label: string; endpoint: string; accept: string }[] = [
	{
		id: 'cloudflare',
		label: 'Cloudflare',
		endpoint: 'https://cloudflare-dns.com/dns-query',
		accept: 'application/dns-json',
	},
	{
		id: 'google',
		label: 'Google',
		endpoint: 'https://dns.google/resolve',
		accept: 'application/json',
	},
	{
		id: 'alibaba',
		label: 'Alibaba',
		endpoint: 'https://dns.alidns.com/resolve',
		accept: 'application/json',
	},
	{
		id: 'dnssb',
		label: 'DNS.SB',
		endpoint: 'https://doh.dns.sb/dns-query',
		accept: 'application/dns-json',
	},
];
