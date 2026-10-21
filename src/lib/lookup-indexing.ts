import 'server-only';

import { resolveRecordType } from '@/lib/dns/doh';
import type { RecordType } from '@/lib/dns/types';
import { getBaseDomain, isIndexableLookupDomain } from '@/lib/domain';
import { DomainAvailability, getDomainAvailability } from '@/lib/whois';

const PRESENCE_TYPES: RecordType[] = ['A', 'AAAA', 'CNAME', 'MX'];

async function resolvesToAnything(domain: string): Promise<boolean> {
	const answers = await Promise.all(
		PRESENCE_TYPES.map(type =>
			resolveRecordType('cloudflare', domain, type, { signal: AbortSignal.timeout(3_000) }),
		),
	);
	return answers.some(records => records.length > 0);
}

export async function shouldIndexLookup(domain: string): Promise<boolean> {
	if (!isIndexableLookupDomain(domain)) return false;

	const base = getBaseDomain(domain);
	if (!base) return false;

	const availability = await getDomainAvailability(base).catch(() => DomainAvailability.UNKNOWN);
	if (
		availability === DomainAvailability.AVAILABLE ||
		availability === DomainAvailability.RESERVED
	) {
		return false;
	}

	return domain === base || resolvesToAnything(domain);
}
