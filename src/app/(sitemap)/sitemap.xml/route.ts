import { siteUrl } from '@/lib/seo';
import { renderSitemapIndex, XML_RESPONSE_HEADERS } from '@/lib/sitemap';

export const dynamic = 'force-static';

export function GET() {
	const base = siteUrl();
	if (!base) return new Response('', { status: 404 });

	const sitemaps = [{ loc: `${base}/sitemap-pages.xml` }, { loc: `${base}/sitemap-common.xml` }];

	return new Response(renderSitemapIndex(sitemaps), { headers: XML_RESPONSE_HEADERS });
}
