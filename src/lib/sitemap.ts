import 'server-only';

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

export function lookupUrls(base: string, domains: string[]): string[] {
	return domains.map(domain => `${base}/lookup/${domain}`);
}
