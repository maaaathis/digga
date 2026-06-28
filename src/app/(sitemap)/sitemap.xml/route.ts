import { siteUrl } from '@/lib/seo';
import {
	chunk,
	DATA_DOMAINS_PER_SITEMAP,
	getDataDomains,
	renderSitemapIndex,
	XML_RESPONSE_HEADERS,
} from '@/lib/sitemap';

export const revalidate = 86400;

export async function GET() {
	const base = siteUrl();
	if (!base) return new Response('', { status: 404 });

	const lastmod = new Date().toISOString();
	const dataShards = chunk(await getDataDomains(), DATA_DOMAINS_PER_SITEMAP);

	const sitemaps = [
		{ loc: `${base}/sitemap-pages.xml`, lastmod },
		{ loc: `${base}/sitemap-common.xml`, lastmod },
		...dataShards.map((_, index) => ({ loc: `${base}/sitemap-data/${index}.xml`, lastmod })),
	];

	return new Response(renderSitemapIndex(sitemaps), { headers: XML_RESPONSE_HEADERS });
}
