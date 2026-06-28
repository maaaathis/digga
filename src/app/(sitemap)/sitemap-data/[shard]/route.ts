import { siteUrl } from '@/lib/seo';
import {
	chunk,
	DATA_DOMAINS_PER_SITEMAP,
	getDataDomains,
	lookupUrls,
	renderUrlset,
	XML_RESPONSE_HEADERS,
} from '@/lib/sitemap';

export const revalidate = 86400;

export async function generateStaticParams() {
	const shardCount = chunk(await getDataDomains(), DATA_DOMAINS_PER_SITEMAP).length;
	return Array.from({ length: shardCount }, (_, index) => ({ shard: `${index}.xml` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ shard: string }> }) {
	const base = siteUrl();
	if (!base) return new Response('', { status: 404 });

	const { shard } = await params;
	const index = Number.parseInt(shard, 10);
	if (!Number.isInteger(index) || index < 0) return new Response('', { status: 404 });

	const domains = chunk(await getDataDomains(), DATA_DOMAINS_PER_SITEMAP)[index];
	if (!domains) return new Response('', { status: 404 });

	const entries = lookupUrls(base, domains).map(loc => ({
		loc,
	}));

	return new Response(renderUrlset(entries), { headers: XML_RESPONSE_HEADERS });
}
