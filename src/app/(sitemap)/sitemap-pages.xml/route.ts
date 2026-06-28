import { siteUrl } from '@/lib/seo';
import { renderUrlset, type UrlEntry, XML_RESPONSE_HEADERS } from '@/lib/sitemap';
import { TOOL_LIST } from '@/lib/tools';

export const dynamic = 'force-static';

export function GET() {
	const base = siteUrl();
	if (!base) return new Response('', { status: 404 });

	const entries: UrlEntry[] = [
		{ loc: base },
		...TOOL_LIST.map(tool => ({
			loc: `${base}/${tool.slug}`,
		})),
		{ loc: `${base}/extension/privacy` },
	];

	return new Response(renderUrlset(entries), { headers: XML_RESPONSE_HEADERS });
}
