import type { Metadata } from 'next';

import { SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/data';
import { TOOLS, type ToolSlug } from '@/lib/tools';

export function siteUrl(): string {
	return process.env.SITE_URL ?? 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
	const base = siteUrl();
	if (path.startsWith('http')) return path;
	return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function buildMetadata({
	title,
	description = SITE_DESCRIPTION,
	path,
	keywords,
	noIndex,
	image,
}: {
	title: string;
	description?: string;
	path: string;
	keywords?: readonly string[];
	noIndex?: boolean;
	image?: string;
}): Metadata {
	const url = absoluteUrl(path);
	return {
		title,
		description,
		keywords: keywords ? [...new Set([...keywords, ...SEO_KEYWORDS])] : [...SEO_KEYWORDS],
		alternates: { canonical: url },
		openGraph: {
			type: 'website',
			title,
			description,
			url,
			siteName: SITE_NAME,
			...(image ? { images: absoluteUrl(image) } : {}),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			...(image ? { images: absoluteUrl(image) } : {}),
		},
		robots: noIndex ? 'noindex, nofollow' : 'index, follow',
	};
}

export function rootMetadata(): Metadata {
	return buildMetadata({
		title: `${SITE_NAME} · ${SITE_TAGLINE}`,
		path: '/',
	});
}

export function toolMetadata(slug: ToolSlug): Metadata {
	const tool = TOOLS[slug];
	return buildMetadata({
		title: tool.title,
		description: tool.description,
		path: `/${tool.slug}`,
		keywords: tool.keywords,
	});
}
