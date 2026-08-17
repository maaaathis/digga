import type { Metadata } from 'next';
import { Globe, Mail } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import DnsSummaryWidget from '@/components/lookup/dns-summary-widget';
import DomainNotRegistered from '@/components/lookup/domain-not-registered';
import DomainReserved from '@/components/lookup/domain-reserved';
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
import { detectHostingProvider } from '@/lib/hosting-provider';
import { getIpsOrgMap } from '@/lib/ip';
import { persistIpMetadata } from '@/lib/ip-metadata';
import { detectMailProvider } from '@/lib/mail-provider';
import { persistObservations } from '@/lib/observations';
import { getRegistrationInfo } from '@/lib/registration';
import { buildMetadata } from '@/lib/seo';
import { maskIpLastOctet } from '@/lib/utils';
import { DomainAvailability, getDomainAvailability } from '@/lib/whois';

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

function started<T>(promise: Promise<T>): Promise<T> {
	promise.catch(() => {});
	return promise;
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

	// Every one of these is an independent network round trip, so they all start
	// now. Awaiting availability first held the DNS and registry work back by the
	// length of a WHOIS query for no benefit. The IP-org lookup still chains off
	// A/AAAA, but it now starts the moment those land rather than after
	// everything else has finished too.
	const registrationPromise = started(getRegistrationInfo(domain));
	const aPromise = started(resolveRecordType('cloudflare', domain, 'A'));
	const aaaaPromise = started(resolveRecordType('cloudflare', domain, 'AAAA'));
	const mxPromise = started(resolveRecordType('cloudflare', domain, 'MX'));
	const nsPromise = started(resolveRecordType('cloudflare', domain, 'NS'));
	const emailPromise = started(analyzeEmailEssentials(domain));
	const ipOrgMapPromise = started(
		Promise.all([aPromise, aaaaPromise]).then(([a, aaaa]) =>
			getIpsOrgMap([...a, ...aaaa].map(record => record.data)),
		),
	);

	const availability = await getDomainAvailability(base);
	if (availability === DomainAvailability.AVAILABLE) {
		return <DomainNotRegistered domain={base} />;
	}
	if (availability === DomainAvailability.RESERVED) {
		return <DomainReserved domain={base} />;
	}

	const [registration, aRecords, aaaaRecords, mxRecords, nsRecords, email] = await Promise.all([
		registrationPromise,
		aPromise,
		aaaaPromise,
		mxPromise,
		nsPromise,
		emailPromise,
	]);

	const resolvedIps = [
		...aRecords.map(record => record.data),
		...aaaaRecords.map(record => record.data),
	];
	const ipOrgMap = await ipOrgMapPromise;

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

	const orgOf = (ip: string | null | undefined) =>
		ip ? (ipOrgMap[ip]?.split(' / ')[0] ?? null) : null;

	const primaryIp = aRecords[0]?.data ?? aaaaRecords[0]?.data ?? null;
	const hostingOrg = orgOf(primaryIp);
	const hostingProvider = detectHostingProvider(hostingOrg);
	const ipv4Provider = detectHostingProvider(orgOf(aRecords[0]?.data));
	const ipv6Provider = detectHostingProvider(orgOf(aaaaRecords[0]?.data));

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
		hostingProvider,
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
						provider={ipv4Provider}
						providerLabel="Hosting provider"
					/>
					<DnsSummaryWidget
						domain={domain}
						title="IPv6"
						type="AAAA"
						records={aaaaRecords}
						icon={<Globe className="size-3.5" />}
						ipOrgMap={ipOrgMap}
						provider={ipv6Provider}
						providerLabel="Hosting provider"
					/>
					<DnsSummaryWidget
						domain={domain}
						title="Mail exchange"
						type="MX"
						records={mxRecords}
						icon={<Mail className="size-3.5" />}
						emptyText="No MX records. This domain probably does not receive mail."
						provider={detectMailProvider(mxRecords)}
						providerLabel="Mail provider"
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
