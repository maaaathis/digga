import type { Metadata } from 'next';
import { Globe, Mail } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import DnsSummaryWidget from '@/components/lookup/dns-summary-widget';
import DomainNotRegistered from '@/components/lookup/domain-not-registered';
import EmailPostureWidget from '@/components/lookup/email-posture-widget';
import QuickFacts, { buildQuickFacts, type EmailPosture } from '@/components/lookup/quick-facts';
import {
	DomainDatesWidget,
	NameserverWidget,
	RegistrantWidget,
	StatusWidget,
} from '@/components/lookup/registration-widgets';
import { logDomainLookup } from '@/lib/bigquery';
import { resolveRecordType } from '@/lib/dns/doh';
import { getBaseDomain, getTLD, isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import { analyzeEmailEssentials } from '@/lib/email-security';
import { getIpsOrgMap } from '@/lib/ip';
import { persistIpMetadata } from '@/lib/ip-metadata';
import { persistObservations } from '@/lib/observations';
import { getRegistrationInfo } from '@/lib/registration';
import { buildMetadata } from '@/lib/seo';
import { maskIpLastOctet } from '@/lib/utils';
import { isDomainAvailable } from '@/lib/whois';

export const fetchCache = 'default-no-store';

type Props = PageProps<'/lookup/[domain]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { domain } = await params;
	const normalized = normalizeDomain(decodeURIComponent(domain));
	if (!isValidLookupDomain(normalized)) {
		return buildMetadata({ title: 'Lookup', path: `/lookup/${domain}`, noIndex: true });
	}

	const registration = await getRegistrationInfo(normalized).catch(() => null);
	const facts: string[] = [];
	if (registration?.registrar) facts.push(`registered with ${registration.registrar}`);
	const created = registration
		? findEventDate(registration.events, ['registration', 'created'])
		: null;
	if (created) {
		const year = new Date(created).getFullYear();
		if (!Number.isNaN(year)) facts.push(`live since ${year}`);
	}
	if (registration?.dnssec === true) facts.push('DNSSEC signed');
	else if (registration?.dnssec === false) facts.push('no DNSSEC');
	if (registration && registration.nameservers.length > 0) {
		facts.push(`${registration.nameservers.length} nameservers`);
	}

	const lead = facts.length > 0 ? `${facts.join(', ')}. ` : '';
	const description =
		`${normalized}: ${lead}DNS records, RDAP and WHOIS registration, subdomains, and email security (SPF, DKIM, DMARC) in one report.`.slice(
			0,
			300,
		);

	return buildMetadata({
		title: `${normalized} · Domain report`,
		description,
		path: `/lookup/${normalized}`,
	});
}

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

	const [registration, aRecords, aaaaRecords, mxRecords, nsRecords, email] = await Promise.all([
		getRegistrationInfo(domain),
		resolveRecordType('cloudflare', domain, 'A'),
		resolveRecordType('cloudflare', domain, 'AAAA'),
		resolveRecordType('cloudflare', domain, 'MX'),
		resolveRecordType('cloudflare', domain, 'NS'),
		analyzeEmailEssentials(domain),
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

	const primaryIp = aRecords[0]?.data ?? aaaaRecords[0]?.data ?? null;
	const hostingOrg = primaryIp ? (ipOrgMap[primaryIp]?.split(' / ')[0] ?? null) : null;

	const emailStatuses = [email.spf.status, email.dmarc.status];
	const emailPosture: EmailPosture = emailStatuses.every(status => status === 'pass')
		? 'full'
		: emailStatuses.every(status => status === 'fail')
			? 'none'
			: 'partial';

	const facts = buildQuickFacts({
		registeredAt: registration
			? findEventDate(registration.events, ['registration', 'created'])
			: null,
		expiresAt: registration ? findEventDate(registration.events, ['expir']) : null,
		dnssec: registration?.dnssec ?? null,
		nameserverCount: registration?.nameservers.length ?? 0,
		hasMx: mxRecords.length > 0,
		registrar: registration?.registrar ?? null,
		hostingOrg,
		emailPosture,
	});

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
					{registration ? <NameserverWidget registration={registration} /> : null}
				</div>

				<div className="space-y-10">
					{registration ? (
						<>
							<RegistrantWidget registration={registration} />
							<DomainDatesWidget registration={registration} />
							<StatusWidget registration={registration} />
						</>
					) : null}
					<EmailPostureWidget domain={domain} spf={email.spf} dmarc={email.dmarc} />
				</div>
			</div>
		</div>
	);
};

export default OverviewPage;
