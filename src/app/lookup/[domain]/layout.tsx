import { AlertTriangle, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import DomainMark from '@/components/lookup/domain-mark';
import LookupTabs from '@/components/lookup/lookup-tabs';
import ShareButton from '@/components/lookup/share-button';
import StateNotice from '@/components/lookup/state-notice';
import SearchForm from '@/components/search/search-form';
import StarPrompt from '@/components/star-prompt';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/data';
import { isValidLookupDomain, normalizeDomain, toUnicodeDomain } from '@/lib/domain';
import { absoluteUrl, buildMetadata } from '@/lib/seo';

type Props = LayoutProps<'/lookup/[domain]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { domain } = await params;
	const normalized = normalizeDomain(decodeURIComponent(domain));
	if (!isValidLookupDomain(normalized)) {
		return buildMetadata({
			title: 'Lookup',
			path: `/lookup/${domain}`,
			noIndex: true,
		});
	}
	return buildMetadata({
		title: `${normalized} · Lookup`,
		description: `DNS records, RDAP, WHOIS, subdomains, and email security for ${normalized}.`,
		path: `/lookup/${normalized}`,
	});
}

const LookupLayout: FC<Props> = async ({ children, params }) => {
	const { domain } = await params;
	const normalized = normalizeDomain(decodeURIComponent(domain));
	if (!isValidLookupDomain(normalized)) {
		return (
			<div className="mx-auto w-full max-w-6xl px-5 pt-6 pb-16">
				<StateNotice
					tone="warning"
					titleAs="h1"
					icon={<AlertTriangle className="size-9" />}
					title="Not a valid domain"
					description="The thing you typed does not look like a domain we can look up. Try an apex, subdomain, or full URL."
				>
					<Button asChild size="lg" className="h-12 px-7 text-base font-semibold">
						<Link href="/">Back to search</Link>
					</Button>
				</StateNotice>
			</div>
		);
	}

	const display = toUnicodeDomain(normalized);
	const lookupUrl = absoluteUrl(`/lookup/${normalized}`);

	const structuredData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'BreadcrumbList',
				'itemListElement': [
					{
						'@type': 'ListItem',
						'position': 1,
						'name': SITE_NAME,
						'item': absoluteUrl('/'),
					},
					{
						'@type': 'ListItem',
						'position': 2,
						'name': normalized,
						'item': lookupUrl,
					},
				],
			},
			{
				'@type': 'WebPage',
				'name': `${normalized} · Domain report`,
				'url': lookupUrl,
				'description': `DNS records, RDAP, WHOIS, subdomains, and email security for ${normalized}.`,
				'about': {
					'@type': 'Thing',
					'name': normalized,
				},
				'isPartOf': {
					'@type': 'WebSite',
					'name': SITE_NAME,
					'url': absoluteUrl('/'),
				},
			},
		],
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-5 pt-6 pb-16">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<div className="mx-auto mb-12 max-w-xl">
				<SearchForm initialValue={normalized} size="lg" />
			</div>

			<div className="border-border/60 mb-8 border-b pb-8">
				<div className="flex flex-col gap-5">
					<div className="flex items-start justify-between gap-4">
						<div className="flex min-w-0 items-center gap-4">
							<DomainMark domain={normalized} />
							<div className="min-w-0">
								<p className="text-muted-foreground mb-1.5 text-xs tracking-wider uppercase">
									Results for
								</p>
								<h1>
									<Link
										href={`https://${normalized}`}
										prefetch={false}
										target="_blank"
										rel="noreferrer noopener"
										className="group inline-flex min-w-0 items-center gap-2"
									>
										<span className="font-display text-foreground min-w-0 truncate pb-1 text-3xl leading-[1.15] font-semibold sm:text-4xl md:text-5xl">
											{display}
										</span>
										<ExternalLink className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-colors" />
									</Link>
								</h1>
							</div>
						</div>
						<ShareButton />
					</div>
				</div>
			</div>

			<div className="mb-8">
				<LookupTabs domain={normalized} />
			</div>

			<div>{children}</div>
			<StarPrompt domain={normalized} />
		</div>
	);
};

export default LookupLayout;
