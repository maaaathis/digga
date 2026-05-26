import type { MetadataRoute } from 'next';

import { getTopDomains } from '@/lib/bigquery';
import { EXAMPLE_DOMAINS } from '@/lib/data';
import { siteUrl } from '@/lib/seo';
import { compareLengthThenAlpha, deduplicate } from '@/lib/utils';

const SUBPATHS = ['', '/dns', '/whois', '/subdomains', '/email'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteUrl();
	if (!base) return [];

	const topDomains = await getTopDomains(1500).catch(() => []);
	const domains = deduplicate([...EXAMPLE_DOMAINS, ...topDomains]).sort(compareLengthThenAlpha);

	const lookupEntries = domains.flatMap(domain =>
		SUBPATHS.map(suffix => ({
			url: `${base}/lookup/${domain}${suffix}`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.5,
		})),
	);

	return [
		{
			url: base,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 1,
		},
		...lookupEntries,
	];
}
