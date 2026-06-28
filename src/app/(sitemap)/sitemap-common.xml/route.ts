import commonDomains from '@/data/common-domains.json';
import { siteUrl } from '@/lib/seo';
import { lookupUrls, renderUrlset, XML_RESPONSE_HEADERS } from '@/lib/sitemap';
import { compareLengthThenAlpha, deduplicate } from '@/lib/utils';

export const dynamic = 'force-static';

export function GET() {
	const base = siteUrl();
	if (!base) return new Response('', { status: 404 });

	const domains = deduplicate(commonDomains as string[]).sort(compareLengthThenAlpha);

	const entries = lookupUrls(base, domains).map(loc => ({
		loc,
	}));

	return new Response(renderUrlset(entries), { headers: XML_RESPONSE_HEADERS });
}
