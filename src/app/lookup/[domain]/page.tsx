import { Globe, Mail } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import DnsSummaryWidget from '@/components/lookup/dns-summary-widget';
import DomainNotRegistered from '@/components/lookup/domain-not-registered';
import QuickFacts, { buildQuickFacts } from '@/components/lookup/quick-facts';
import {
	DomainDatesWidget,
	NameserverWidget,
	RegistrantWidget,
	StatusWidget,
} from '@/components/lookup/registration-widgets';
import { logDomainLookup } from '@/lib/bigquery';
import { resolveRecordType } from '@/lib/dns/doh';
import { getBaseDomain, getTLD, isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import { getIpsOrgMap } from '@/lib/ip';
import { persistIpMetadata } from '@/lib/ip-metadata';
import { persistObservations } from '@/lib/observations';
import { getRegistrationInfo } from '@/lib/registration';
import { maskIpLastOctet } from '@/lib/utils';
import { isDomainAvailable } from '@/lib/whois';

export const fetchCache = 'default-no-store';

type Props = PageProps<'/lookup/[domain]'>;

function findEventDate(
	events: { action: string; date: string }[] | undefined,
	needles: string[],
): string | null {
	if (!events) return null;
	const lowerNeedles = needles.map(needle => needle.toLowerCase());
	for (const event of events) {
		const action = event.action.toLowerCase();
		if (lowerNeedles.some(needle => action.includes(needle))) {
			return event.date;
		}
	}
	return null;
}

const OverviewPage: FC<Props> = async ({ params }) => {
	const { domain: raw } = await params;
	const domain = normalizeDomain(decodeURIComponent(raw));
	if (!isValidLookupDomain(domain)) notFound();

	const base = getBaseDomain(domain);
	if (!base) notFound();

	const requestHeaders = await headers();
	const clientIp =
		requestHeaders.get('cf-connecting-ip') ||
		requestHeaders.get('x-real-ip') ||
		requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		null;

	void logDomainLookup({
		domain,
		baseDomain: base,
		publicSuffix: getTLD(base),
		ip: maskIpLastOctet(clientIp),
	});

	if (await isDomainAvailable(base)) {
		return <DomainNotRegistered domain={base} />;
	}

	const [registration, aRecords, aaaaRecords, mxRecords, nsRecords] = await Promise.all([
		getRegistrationInfo(domain),
		resolveRecordType('cloudflare', domain, 'A'),
		resolveRecordType('cloudflare', domain, 'AAAA'),
		resolveRecordType('cloudflare', domain, 'MX'),
		resolveRecordType('cloudflare', domain, 'NS'),
	]);

	const resolvedIps = [
		...aRecords.map(record => record.data),
		...aaaaRecords.map(record => record.data),
	];
	const ipOrgMap = await getIpsOrgMap(resolvedIps);

	void persistObservations({
		domain,
		resolver: 'cloudflare',
		recordSets: [
			{ type: 'A', records: aRecords },
			{ type: 'AAAA', records: aaaaRecords },
			{ type: 'MX', records: mxRecords },
			{ type: 'NS', records: nsRecords },
		],
	});
	if (resolvedIps.length > 0) {
		void persistIpMetadata(resolvedIps);
	}

	const facts = registration
		? buildQuickFacts({
				registeredAt: findEventDate(registration.events, ['registration', 'created']),
				expiresAt: findEventDate(registration.events, ['expir']),
				dnssec: registration.dnssec,
				nameserverCount: registration.nameservers.length,
				hasMx: mxRecords.length > 0,
				registrar: registration.registrar ?? null,
			})
		: [];

	return (
		<div className="space-y-12">
			{facts.length > 0 ? <QuickFacts facts={facts} /> : null}

			<div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[1.1fr_1fr]">
				<div className="space-y-10">
					<DnsSummaryWidget
						domain={domain}
						title="IPv4"
						type="A"
						records={aRecords}
						icon={<Globe className="size-3.5" />}
						ipOrgMap={ipOrgMap}
					/>
					<DnsSummaryWidget
						domain={domain}
						title="IPv6"
						type="AAAA"
						records={aaaaRecords}
						icon={<Globe className="size-3.5" />}
						ipOrgMap={ipOrgMap}
					/>
					<DnsSummaryWidget
						domain={domain}
						title="Mail exchange"
						type="MX"
						records={mxRecords}
						icon={<Mail className="size-3.5" />}
						emptyText="No MX records. This domain probably does not receive mail."
					/>
				</div>

				<div className="space-y-10">
					{registration ? (
						<>
							<RegistrantWidget registration={registration} />
							<DomainDatesWidget registration={registration} />
							<NameserverWidget registration={registration} />
							<StatusWidget registration={registration} />
						</>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default OverviewPage;
