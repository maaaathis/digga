import { siteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET(): Response {
	const base = siteUrl();
	const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /lookup/*/subdomains
Content-Signal: ai-train=yes, search=yes, ai-input=yes

Sitemap: ${base}/sitemap.xml
Host: ${base}
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400',
		},
	});
}
