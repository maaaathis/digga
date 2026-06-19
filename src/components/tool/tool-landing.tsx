import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

import SearchForm from '@/components/search/search-form';
import ToolIcon from '@/components/tool/tool-icon';
import { EXAMPLE_DOMAINS, SITE_NAME } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';
import { TOOLS, type ToolSlug } from '@/lib/tools';

type ToolLandingProps = { slug: ToolSlug };

const ToolLanding: FC<ToolLandingProps> = ({ slug }) => {
	const tool = TOOLS[slug];
	const toolUrl = absoluteUrl(`/${tool.slug}`);

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		'itemListElement': [
			{ '@type': 'ListItem', 'position': 1, 'name': SITE_NAME, 'item': absoluteUrl('/') },
			{ '@type': 'ListItem', 'position': 2, 'name': tool.name, 'item': toolUrl },
		],
	};

	const appSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		'name': `${tool.name} · ${SITE_NAME}`,
		'description': tool.description,
		'url': toolUrl,
		'applicationCategory': 'DeveloperApplication',
		'operatingSystem': 'Any',
		'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
		'isPartOf': { '@type': 'WebSite', 'name': SITE_NAME, 'url': absoluteUrl('/') },
	};

	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'mainEntity': tool.faq.map(entry => ({
			'@type': 'Question',
			'name': entry.q,
			'acceptedAnswer': { '@type': 'Answer', 'text': entry.a },
		})),
	};

	return (
		<div className="w-full">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
			/>

			<section className="mx-auto flex w-full max-w-4xl flex-col items-center px-5 pt-16 pb-16 text-center md:pt-24">
				<div className="ring-border/60 bg-background text-foreground mb-6 inline-flex size-12 items-center justify-center rounded-2xl ring-1">
					<ToolIcon iconKey={tool.iconKey} />
				</div>
				<p className="text-muted-foreground mb-4 text-xs tracking-wider uppercase">
					{tool.eyebrow}
				</p>

				<h1 className="font-display text-foreground text-balance text-4xl leading-[1.07] font-semibold md:text-6xl md:leading-[1.05]">
					{tool.h1}
				</h1>

				<p className="text-muted-foreground text-balance mt-6 max-w-2xl text-base md:text-lg">
					{tool.heroSubtitle}
				</p>

				<div className="mt-10 w-full max-w-2xl">
					<SearchForm size="lg" tool={tool.lookupSegment} autofocus />
				</div>

				<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
					<span className="text-muted-foreground text-xs">Try</span>
					{EXAMPLE_DOMAINS.map(domain => (
						<Link
							key={domain}
							href={`/lookup/${domain}/${tool.lookupSegment}`}
							className="bg-muted/60 hover:bg-muted text-foreground rounded-full px-2.5 py-1 font-mono text-xs transition-colors"
						>
							{domain}
						</Link>
					))}
				</div>
			</section>

			<section className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16">
				<div className="mb-10">
					<p className="text-muted-foreground text-xs tracking-wider uppercase">What you get</p>
					<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
						Everything in one report.
					</h2>
				</div>

				<ul className="border-border/60 grid grid-cols-1 overflow-hidden rounded-3xl border md:grid-cols-2">
					{tool.bullets.map((bullet, index) => (
						<li
							key={bullet.title}
							className="border-border/60 bg-card/50 hover:bg-card relative flex flex-col gap-2 border-b border-r p-6 transition-colors md:[&:nth-child(2n)]:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0"
						>
							<span className="text-muted-foreground/50 absolute top-5 right-5 font-mono text-[11px] tabular-nums">
								{String(index + 1).padStart(2, '0')}
							</span>
							<h3 className="text-foreground text-base font-semibold">{bullet.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">{bullet.body}</p>
						</li>
					))}
				</ul>
			</section>

			<section className="mx-auto w-full max-w-4xl px-5 pt-8 pb-16">
				<div className="space-y-8">
					{tool.sections.map(section => (
						<article
							key={section.heading}
							className="border-border/60 border-b pb-8 last:border-b-0 last:pb-0"
						>
							<h2 className="text-foreground text-xl font-semibold">{section.heading}</h2>
							<p className="text-muted-foreground mt-3 text-base leading-relaxed">{section.body}</p>
						</article>
					))}
				</div>
			</section>

			<section className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16">
				<div className="mb-8">
					<p className="text-muted-foreground text-xs tracking-wider uppercase">Keep digging</p>
					<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
						Related tools.
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{tool.related.map(relatedSlug => {
						const related = TOOLS[relatedSlug];
						return (
							<Link
								key={related.slug}
								href={`/${related.slug}`}
								prefetch={false}
								className="group border-border/60 bg-card/50 hover:bg-card flex items-center gap-3 rounded-2xl border p-5 transition-colors"
							>
								<span className="ring-border/60 bg-background text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-xl ring-1">
									<ToolIcon iconKey={related.iconKey} className="size-4" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="text-foreground block text-sm font-semibold">
										{related.name}
									</span>
								</span>
								<ArrowRight className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
							</Link>
						);
					})}
				</div>
			</section>

			<section className="mx-auto w-full max-w-4xl px-5 pt-8 pb-16">
				<div className="mb-10">
					<p className="text-muted-foreground text-xs tracking-wider uppercase">FAQ</p>
					<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
						Questions, answered.
					</h2>
				</div>

				<div className="border-border/60 divide-border/60 divide-y overflow-hidden rounded-2xl border">
					{tool.faq.map((entry, index) => (
						<details
							key={entry.q}
							className="group bg-card/30 open:bg-card transition-colors"
							open={index === 0}
						>
							<summary className="hover:text-foreground text-foreground flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-base font-medium select-none">
								<span>{entry.q}</span>
								<span
									aria-hidden
									className="text-muted-foreground transition-transform group-open:rotate-45"
								>
									+
								</span>
							</summary>
							<div className="text-muted-foreground px-6 pb-6 text-sm leading-relaxed">
								{entry.a}
							</div>
						</details>
					))}
				</div>
			</section>

			<section className="mx-auto w-full max-w-3xl px-5 pt-8 pb-16 text-center">
				<h2 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
					Ready to dig?
				</h2>
				<p className="text-muted-foreground mt-3">
					Enter a domain to run the {tool.name.toLowerCase()} now.
				</p>
				<div className="mt-8">
					<SearchForm size="md" tool={tool.lookupSegment} />
				</div>
			</section>
		</div>
	);
};

export default ToolLanding;
