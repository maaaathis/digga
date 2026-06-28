import 'server-only';

import { unstable_cache } from 'next/cache';

import commonDomains from '@/data/common-domains.json';
import { getTopDomains } from '@/lib/bigquery';
import { compareLengthThenAlpha, deduplicate } from '@/lib/utils';

export const LOOKUP_SUBPATHS = ['', '/dns', '/whois', '/subdomains', '/email', '/tls'] as const;

export const DATA_DOMAINS_PER_SITEMAP = 7000;

const MAX_DATA_DOMAINS = 50_000;

export const XML_RESPONSE_HEADERS = {
	'Content-Type': 'application/xml',
	'Cache-Control': 'public, max-age=86400',
} as const;

export const escapeXml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

export type UrlEntry = {
	loc: string;
	lastmod?: string;
	changefreq?: string;
	priority?: number;
};

export function renderUrlset(entries: UrlEntry[]): string {
	const urls = entries
		.map(entry => {
			const lines = [`\t\t<loc>${escapeXml(entry.loc)}</loc>`];
			if (entry.lastmod) lines.push(`\t\t<lastmod>${entry.lastmod}</lastmod>`);
			if (entry.changefreq) lines.push(`\t\t<changefreq>${entry.changefreq}</changefreq>`);
			if (entry.priority !== undefined) lines.push(`\t\t<priority>${entry.priority}</priority>`);
			return `\t<url>\n${lines.join('\n')}\n\t</url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function renderSitemapIndex(sitemaps: { loc: string; lastmod?: string }[]): string {
	const entries = sitemaps
		.map(sitemap => {
			const lines = [`\t\t<loc>${escapeXml(sitemap.loc)}</loc>`];
			if (sitemap.lastmod) lines.push(`\t\t<lastmod>${sitemap.lastmod}</lastmod>`);
			return `\t<sitemap>\n${lines.join('\n')}\n\t</sitemap>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`;
}

export function chunk<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		chunks.push(items.slice(i, i + size));
	}
	return chunks;
}

export function lookupUrls(base: string, domains: string[]): string[] {
	return domains.flatMap(domain =>
		LOOKUP_SUBPATHS.map(suffix => `${base}/lookup/${domain}${suffix}`),
	);
}

export const getDataDomains = unstable_cache(
	async (): Promise<string[]> => {
		const common = new Set(deduplicate(commonDomains as string[]));
		const top = await getTopDomains(MAX_DATA_DOMAINS).catch(() => []);
		return deduplicate(top)
			.filter(domain => !common.has(domain))
			.sort(compareLengthThenAlpha);
	},
	['sitemap-data-domains'],
	{ revalidate: 86400 },
);
