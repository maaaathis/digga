import commonDomains from '@/data/common-domains.json';
import { siteUrl } from '@/lib/seo';
import { compareLengthThenAlpha, deduplicate } from '@/lib/utils';

export const dynamic = 'force-static';

const SUBPATHS = ['', '/dns', '/whois', '/subdomains', '/email'];

const escapeXml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

export async function GET() {
	const base = siteUrl();
	if (!base) {
		return new Response('', { status: 404 });
	}

	const domains = deduplicate(commonDomains as string[]).sort(compareLengthThenAlpha);
	const lastModified = new Date().toISOString();

	const urls = domains.flatMap(domain =>
		SUBPATHS.map(suffix => `${base}/lookup/${domain}${suffix}`),
	);

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-0.9">
${urls
	.map(
		url => `\t<url>
\t\t<loc>${escapeXml(url)}</loc>
\t\t<lastmod>${lastModified}</lastmod>
\t\t<changefreq>weekly</changefreq>
\t\t<priority>0.5</priority>
\t</url>`,
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=86400',
		},
	});
}
