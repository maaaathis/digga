import { AlertOctagon, ScrollText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type FC, Fragment } from 'react';

import StateNotice from '@/components/lookup/state-notice';
import WhoisTabs from '@/components/lookup/whois-tabs';
import { getBaseDomain, getTLD, isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import { lookupRdap } from '@/lib/rdap/client';
import type { NormalizedRdap } from '@/lib/rdap/types';
import { buildMetadata } from '@/lib/seo';
import { lookupWhoisRaw, type WhoisRawByServer } from '@/lib/whois';

export const fetchCache = 'default-no-store';

export async function generateMetadata({
	params,
}: PageProps<'/lookup/[domain]/whois'>): Promise<Metadata> {
	const { domain } = await params;
	const normalized = normalizeDomain(decodeURIComponent(domain));
	return buildMetadata({
		title: `RDAP and WHOIS for ${normalized}`,
		description: `Registration data for ${normalized}. RDAP first with WHOIS fallback.`,
		path: `/lookup/${normalized}/whois`,
	});
}

type Loaded = {
	rdap: NormalizedRdap | null;
	rdapUnsupported: boolean;
	whois: WhoisRawByServer | null;
	base: string;
	tld: string | null;
};

async function load(domain: string): Promise<Loaded> {
	const base = getBaseDomain(domain);
	if (!base) {
		return { rdap: null, rdapUnsupported: true, whois: null, base: '', tld: null };
	}

	const tld = getTLD(base);
	const [rdapResult, whois] = await Promise.all([lookupRdap(domain), lookupWhoisRaw(domain)]);

	return {
		rdap: rdapResult.kind === 'ok' ? rdapResult.data : null,
		rdapUnsupported: rdapResult.kind === 'unsupported' || rdapResult.kind === 'not-found',
		whois,
		base,
		tld,
	};
}

const WhoisPage: FC<PageProps<'/lookup/[domain]/whois'>> = async ({ params }) => {
	const { domain: raw } = await params;
	const domain = normalizeDomain(decodeURIComponent(raw));
	if (!isValidLookupDomain(domain)) notFound();

	const data = await load(domain);
	const hasRdap = Boolean(data.rdap);
	const hasWhois = Boolean(data.whois && Object.keys(data.whois).length > 0);
	const defaultTab: 'rdap' | 'whois' = hasRdap ? 'rdap' : hasWhois ? 'whois' : 'rdap';

	if (data.tld === 'ch' || data.tld === 'li') {
		return (
			<RegistryNotice
				tld={data.tld}
				registryUrl={data.tld === 'ch' ? 'https://www.nic.ch/whois/' : 'https://www.nic.li/whois/'}
				base={data.base}
			/>
		);
	}

	if (!hasRdap && !hasWhois) {
		return (
			<StateNotice
				tone="neutral"
				icon={<AlertOctagon className="size-9" />}
				title="Registration data unavailable"
				description={
					<>
						Neither RDAP nor WHOIS returned data for this domain. Try{' '}
						<Link
							href={`https://lookup.icann.org/whois/en?q=${data.base}&t=a`}
							target="_blank"
							rel="noreferrer noopener"
							className="hover:text-foreground underline underline-offset-4"
						>
							ICANN
						</Link>
						.
					</>
				}
			/>
		);
	}

	return (
		<WhoisTabs
			defaultValue={defaultTab}
			hasRdap={hasRdap}
			hasWhois={hasWhois}
			rdapPanel={data.rdap ? <RdapPanel data={data.rdap} /> : null}
			whoisPanel={data.whois ? <WhoisPanel data={data.whois} base={data.base} /> : null}
		/>
	);
};

const RegistryNotice: FC<{
	tld: string;
	registryUrl: string;
	base: string;
}> = ({ tld, registryUrl, base }) => (
	<StateNotice
		tone="neutral"
		icon={<ScrollText className="size-9" />}
		title="Registry does not allow automated lookups"
		description={
			<>
				SWITCH, the registry for {`.${tld}`} domains, blocks automated WHOIS and RDAP queries. Try a
				manual lookup at{' '}
				<Link
					href={registryUrl}
					target="_blank"
					rel="noreferrer noopener"
					className="hover:text-foreground underline underline-offset-4"
				>
					SWITCH
				</Link>{' '}
				for <span className="font-mono">{base}</span>.
			</>
		}
	/>
);

const RdapPanel: FC<{ data: NormalizedRdap }> = ({ data }) => (
	<div className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-sm">
		<header className="border-border/60 border-b px-5 py-4">
			<p className="text-muted-foreground text-xs uppercase tracking-wider">RDAP source</p>
			<p className="text-foreground mt-0.5 font-mono text-sm">{data.server}</p>
		</header>
		<pre className="overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed">
			{JSON.stringify(data.raw, null, 2)}
		</pre>
	</div>
);

const WhoisPanel: FC<{ data: WhoisRawByServer; base: string }> = ({ data, base }) => (
	<div className="space-y-6">
		{Object.entries(data).map(([server, raw]) => (
			<Fragment key={server}>
				<section className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-sm">
					<header className="border-border/60 border-b px-5 py-4">
						<p className="text-muted-foreground text-xs uppercase tracking-wider">WHOIS server</p>
						<p className="text-foreground mt-0.5 font-mono text-sm">{server}</p>
					</header>
					{raw ? (
						<pre className="overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
							{raw}
						</pre>
					) : (
						<p className="text-muted-foreground px-5 py-4 text-sm">
							No data returned by this server.
						</p>
					)}
				</section>
			</Fragment>
		))}
		<p className="text-muted-foreground text-xs">
			Make a direct request at{' '}
			<Link
				href={`https://lookup.icann.org/whois/en?q=${base}&t=a`}
				target="_blank"
				rel="noreferrer noopener"
				className="hover:text-foreground underline underline-offset-4"
			>
				ICANN
			</Link>
			.
		</p>
	</div>
);

export default WhoisPage;
