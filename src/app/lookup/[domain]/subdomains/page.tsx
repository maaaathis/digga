import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import SubdomainScanner from '@/components/lookup/subdomain-scanner';
import { isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
	params,
}: PageProps<'/lookup/[domain]/subdomains'>): Promise<Metadata> {
	const { domain } = await params;
	const normalized = normalizeDomain(decodeURIComponent(domain));
	return buildMetadata({
		title: `Subdomains for ${normalized}`,
		description: `Passive subdomain discovery for ${normalized}.`,
		path: `/lookup/${normalized}/subdomains`,
	});
}

const SubdomainsPage: FC<PageProps<'/lookup/[domain]/subdomains'>> = async ({ params }) => {
	const { domain: raw } = await params;
	const domain = normalizeDomain(decodeURIComponent(raw));
	if (!isValidLookupDomain(domain)) notFound();

	return <SubdomainScanner domain={domain} />;
};

export default SubdomainsPage;
