import { Building2, CalendarClock, KeyRound, Server, ShieldCheck, UserRound } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import CopyButton from '@/components/copy-button';
import ProviderBadge from '@/components/lookup/provider-badge';
import RawDisclosure from '@/components/lookup/raw-disclosure';
import { Badge } from '@/components/ui/badge';
import { detectDnsProvider } from '@/lib/dns-provider';
import type { NormalizedRdap } from '@/lib/rdap/types';
import { describeStatus } from '@/lib/rdap/status-codes';

export type DsRecord = { keyTag: number; algorithm: number; digestType: number; digest: string };

export type RegistrationRecordData = {
	sourceLabel: string;
	server?: string;
	port43?: string;
	registrar?: { name?: string; ianaId?: string; abuseEmail?: string };
	registrant?: { name?: string; organization?: string; country?: string };
	events: { action: string; date: string }[];
	status: string[];
	nameservers: string[];
	dnssec: boolean | null;
	dsData?: DsRecord[];
	raw: { label: string; value: string };
};

type WhoisBlock = Record<string, string | string[] | undefined>;

const DNSSEC_ALGORITHMS: Record<number, string> = {
	5: 'RSASHA1',
	7: 'NSEC3RSASHA1',
	8: 'RSASHA256',
	10: 'RSASHA512',
	13: 'ECDSAP256SHA256',
	14: 'ECDSAP384SHA384',
	15: 'ED25519',
	16: 'ED448',
};

function firstString(value: string | string[] | undefined): string | undefined {
	if (Array.isArray(value)) return value.find(item => typeof item === 'string' && item.length > 0);
	return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asStringArray(value: string | string[] | undefined): string[] {
	if (!value) return [];
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === 'string')
		: [value];
}

function parseWhoisEvents(block: WhoisBlock): { action: string; date: string }[] {
	const map: [string, string][] = [
		['Created Date', 'registration'],
		['Creation Date', 'registration'],
		['Registered On', 'registration'],
		['Updated Date', 'last changed'],
		['Last Updated', 'last changed'],
		['Registry Expiry Date', 'expiration'],
		['Expiry Date', 'expiration'],
		['Expires Date', 'expiration'],
		['Expiration Date', 'expiration'],
	];
	const seen = new Set<string>();
	const events: { action: string; date: string }[] = [];
	for (const [key, action] of map) {
		if (seen.has(action)) continue;
		const value = firstString(block[key]);
		if (value) {
			events.push({ action, date: value });
			seen.add(action);
		}
	}
	return events;
}

export function rdapToRecord(data: NormalizedRdap): RegistrationRecordData {
	return {
		sourceLabel: 'RDAP',
		server: data.server,
		port43: data.raw.port43,
		registrar: data.registrar,
		registrant: data.registrant,
		events: data.events,
		status: data.status,
		nameservers: data.nameservers,
		dnssec: data.dnssec,
		dsData: data.raw.secureDNS?.dsData,
		raw: { label: 'Raw RDAP response (JSON)', value: JSON.stringify(data.raw, null, 2) },
	};
}

export function whoisBlockToRecord(
	server: string,
	block: WhoisBlock,
	rawText: string,
): RegistrationRecordData {
	const dnssecValue = firstString(block['DNSSEC']);
	return {
		sourceLabel: 'WHOIS',
		server,
		registrar: {
			name: firstString(block['Registrar']),
			ianaId: firstString(block['Registrar IANA ID']),
			abuseEmail: firstString(block['Registrar Abuse Contact Email']),
		},
		registrant: {
			name: firstString(block['Registrant Name']),
			organization: firstString(block['Registrant Organization']),
			country: firstString(block['Registrant Country']),
		},
		events: parseWhoisEvents(block),
		status: asStringArray(block['Domain Status']),
		nameservers: asStringArray(block['Name Server']).map(ns => ns.toLowerCase()),
		dnssec: dnssecValue ? !dnssecValue.toLowerCase().includes('unsigned') : null,
		raw: { label: 'Raw WHOIS record', value: rawText },
	};
}

function formatDate(input: string): string {
	const date = new Date(input);
	if (Number.isNaN(date.getTime())) return input;
	return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

function relativeTime(input: string): string | null {
	const date = new Date(input);
	if (Number.isNaN(date.getTime())) return null;
	const diff = date.getTime() - Date.now();
	const day = 86_400_000;
	const year = day * 365.25;
	const month = year / 12;
	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	const abs = Math.abs(diff);
	if (abs >= year) return rtf.format(Math.round(diff / year), 'year');
	if (abs >= month) return rtf.format(Math.round(diff / month), 'month');
	return rtf.format(Math.round(diff / day), 'day');
}

const Row: FC<{ icon: ReactNode; label: string; children: ReactNode }> = ({
	icon,
	label,
	children,
}) => (
	<div className="grid grid-cols-1 gap-x-4 gap-y-2 px-5 py-4 sm:grid-cols-[180px_1fr]">
		<dt className="text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase">
			<span className="text-muted-foreground/70">{icon}</span>
			{label}
		</dt>
		<dd className="min-w-0">{children}</dd>
	</div>
);

const RegistrationRecord: FC<{ data: RegistrationRecordData }> = ({ data }) => {
	const hasRegistrar = Boolean(
		data.registrar?.name || data.registrar?.ianaId || data.registrar?.abuseEmail,
	);
	const hasRegistrant = Boolean(data.registrant?.organization || data.registrant?.name);
	const provider = data.nameservers.length > 0 ? detectDnsProvider(data.nameservers) : null;

	return (
		<section className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-sm">
			{data.server ? (
				<header className="border-border/60 flex items-start justify-between gap-3 border-b px-5 py-4">
					<div className="min-w-0">
						<p className="text-muted-foreground text-xs tracking-wider uppercase">
							{data.sourceLabel} source
						</p>
						<p className="text-foreground mt-0.5 truncate font-mono text-sm">{data.server}</p>
						{data.port43 ? (
							<p className="text-muted-foreground mt-1 font-mono text-xs">port 43: {data.port43}</p>
						) : null}
					</div>
					<CopyButton value={data.server} />
				</header>
			) : null}

			<dl className="divide-border/60 divide-y">
				{hasRegistrar ? (
					<Row icon={<Building2 className="size-3.5" />} label="Registrar">
						<div className="text-sm">
							<p className="text-foreground font-medium">
								{data.registrar?.name ?? 'Unknown'}
								{data.registrar?.ianaId ? (
									<span className="text-muted-foreground ml-2 font-mono text-xs">
										IANA {data.registrar.ianaId}
									</span>
								) : null}
							</p>
							{data.registrar?.abuseEmail ? (
								<p className="text-muted-foreground mt-1 flex items-center gap-1 font-mono text-xs">
									<span className="truncate">{data.registrar.abuseEmail}</span>
									<CopyButton value={data.registrar.abuseEmail} />
								</p>
							) : null}
						</div>
					</Row>
				) : null}

				{hasRegistrant ? (
					<Row icon={<UserRound className="size-3.5" />} label="Registrant">
						<p className="text-foreground text-sm font-medium">
							{data.registrant?.organization ?? data.registrant?.name}
							{data.registrant?.country ? (
								<span className="text-muted-foreground ml-2 text-xs">
									{data.registrant.country}
								</span>
							) : null}
						</p>
					</Row>
				) : null}

				{data.events.length > 0 ? (
					<Row icon={<CalendarClock className="size-3.5" />} label="Timeline">
						<ul className="space-y-2">
							{data.events.map(event => {
								const relative = relativeTime(event.date);
								return (
									<li
										key={`${event.action}-${event.date}`}
										className="flex flex-wrap items-baseline gap-x-2 text-sm"
									>
										<span className="text-muted-foreground w-28 shrink-0 text-xs capitalize">
											{event.action}
										</span>
										<span className="text-foreground font-mono text-xs">
											{formatDate(event.date)}
										</span>
										{relative ? (
											<span className="text-muted-foreground text-xs">({relative})</span>
										) : null}
									</li>
								);
							})}
						</ul>
					</Row>
				) : null}

				{data.status.length > 0 ? (
					<Row icon={<KeyRound className="size-3.5" />} label="Status">
						<ul className="space-y-2.5">
							{data.status.map(status => {
								const described = describeStatus(status);
								return (
									<li key={status}>
										<Badge variant="secondary" className="font-mono text-xs">
											{described.label}
										</Badge>
										{described.description ? (
											<p className="text-muted-foreground mt-1 text-xs">{described.description}</p>
										) : null}
									</li>
								);
							})}
						</ul>
					</Row>
				) : null}

				{data.nameservers.length > 0 ? (
					<Row icon={<Server className="size-3.5" />} label="Nameservers">
						<div className="space-y-2">
							{provider ? (
								<ProviderBadge name={provider.name} domain={provider.domain} label="DNS provider" />
							) : null}
							<ul className="space-y-1.5">
								{data.nameservers.map(ns => (
									<li
										key={ns}
										className="bg-muted/40 hover:bg-muted/60 group flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-mono text-xs transition-colors"
									>
										<span className="truncate">{ns}</span>
										<CopyButton value={ns} className="opacity-0 group-hover:opacity-100" />
									</li>
								))}
							</ul>
						</div>
					</Row>
				) : null}

				{data.dnssec !== null ? (
					<Row icon={<ShieldCheck className="size-3.5" />} label="DNSSEC">
						<div className="space-y-2">
							<p className="text-foreground flex items-center gap-2 text-sm">
								<span
									className={
										data.dnssec
											? 'inline-flex size-2.5 rounded-full bg-emerald-500'
											: 'inline-flex size-2.5 rounded-full bg-amber-500'
									}
									aria-hidden
								/>
								{data.dnssec ? 'Signed delegation in place.' : 'No DNSSEC delegation reported.'}
							</p>
							{data.dsData && data.dsData.length > 0 ? (
								<ul className="space-y-1">
									{data.dsData.map(ds => (
										<li
											key={`${ds.keyTag}-${ds.digest}`}
											className="text-muted-foreground font-mono text-xs"
										>
											keytag {ds.keyTag} · alg {ds.algorithm}
											{DNSSEC_ALGORITHMS[ds.algorithm]
												? ` (${DNSSEC_ALGORITHMS[ds.algorithm]})`
												: ''}{' '}
											· digest type {ds.digestType}
										</li>
									))}
								</ul>
							) : null}
						</div>
					</Row>
				) : null}
			</dl>

			{data.raw.value ? <RawDisclosure label={data.raw.label} value={data.raw.value} /> : null}
		</section>
	);
};

export default RegistrationRecord;
