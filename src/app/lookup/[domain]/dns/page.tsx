import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import DnsExplorer from '@/components/lookup/dns-explorer';
import { resolveAllRecords } from '@/lib/dns/doh';
import { isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import { buildMetadata } from '@/lib/seo';

export const fetchCache = 'default-no-store';

export async function generateMetadata({
	params,
}: PageProps<'/lookup/[domain]/dns'>): Promise<Metadata> {
	const { domain } = await params;
	const normalized = normalizeDomain(decodeURIComponent(domain));
	return buildMetadata({
		title: `DNS records for ${normalized}`,
		description: `Live DNS records for ${normalized}: A, AAAA, MX, NS, TXT, CAA, and more. Switch between Cloudflare, Google, and Alibaba resolvers.`,
		path: `/lookup/${normalized}/dns`,
	});
}

const DnsPage: FC<PageProps<'/lookup/[domain]/dns'>> = async ({ params }) => {
	const { domain: raw } = await params;
	const domain = normalizeDomain(decodeURIComponent(raw));
	if (!isValidLookupDomain(domain)) notFound();

	const initialRecords = await resolveAllRecords('cloudflare', domain);

	return (
		<DnsExplorer domain={domain} initialResolver="cloudflare" initialRecords={initialRecords} />
	);
};

export default DnsPage;
