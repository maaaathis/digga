import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

import EmailSecurityReportView from '@/components/lookup/email-security-report';
import { isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import { analyzeEmailSecurity } from '@/lib/email-security';
import { buildMetadata } from '@/lib/seo';

export const fetchCache = 'default-no-store';

export async function generateMetadata({
	params,
}: PageProps<'/lookup/[domain]/email'>): Promise<Metadata> {
	const { domain } = await params;
	const normalized = normalizeDomain(decodeURIComponent(domain));
	return buildMetadata({
		title: `Email security for ${normalized}`,
		description: `SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and BIMI checks for ${normalized}. See how well the domain is protected against email spoofing.`,
		path: `/lookup/${normalized}/email`,
	});
}

const EmailPage: FC<PageProps<'/lookup/[domain]/email'>> = async ({ params }) => {
	const { domain: raw } = await params;
	const domain = normalizeDomain(decodeURIComponent(raw));
	if (!isValidLookupDomain(domain)) notFound();

	const report = await analyzeEmailSecurity(domain);

	return <EmailSecurityReportView report={report} />;
};

export default EmailPage;
