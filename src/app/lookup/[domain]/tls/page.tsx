import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import TlsReport from '@/components/lookup/tls-report';
import { isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import { buildMetadata } from '@/lib/seo';
import { getTlsCertificate } from '@/lib/tls';

export const fetchCache = 'default-no-store';

export async function generateMetadata({
	params,
}: PageProps<'/lookup/[domain]/tls'>): Promise<Metadata> {
	const { domain } = await params;
	const normalized = normalizeDomain(decodeURIComponent(domain));
	return buildMetadata({
		title: `TLS certificate for ${normalized}`,
		description: `Live TLS/SSL certificate check for ${normalized}. See the issuer, validity window, expiry countdown, protocol, cipher, SANs, and chain.`,
		path: `/lookup/${normalized}/tls`,
	});
}

const TlsPage: FC<PageProps<'/lookup/[domain]/tls'>> = async ({ params }) => {
	const { domain: raw } = await params;
	const domain = normalizeDomain(decodeURIComponent(raw));
	if (!isValidLookupDomain(domain)) notFound();

	const result = await getTlsCertificate(domain);

	return <TlsReport domain={domain} result={result} />;
};

export default TlsPage;
