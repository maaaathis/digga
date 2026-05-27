import { ArrowUpRight, Globe, Sparkles } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type DomainNotRegisteredProps = {
	domain: string;
};

type Registrar = {
	name: string;
	href: string;
	note?: ReactNode;
};

const REGISTRARS: Registrar[] = [
	{
		name: 'Namecheap',
		href: 'https://namecheap.pxf.io/c/7347081/386170/5618?u=https%3A%2F%2Fwww.namecheap.com%2Fdomains%2Fregistration%2Fresults.aspx%3Fdomain%3D{domain}',
	},
];

const buildRegistrarUrl = (href: string, domain: string): string =>
	href.replace('{domain}', encodeURIComponent(domain));

const DomainNotRegistered: FC<DomainNotRegisteredProps> = ({ domain }) => {
	const [primary, ...secondary] = REGISTRARS;

	return (
		<section className="bg-card border-border/60 ring-soft surface-blur relative w-full overflow-hidden rounded-3xl border px-6 py-20 sm:px-10 sm:py-24">
			{/* soft glow behind the badge */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,color-mix(in_oklab,var(--color-emerald-500)_16%,transparent),transparent_72%)]"
			/>

			<div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
				<div className="ring-border/60 bg-card inline-flex size-20 items-center justify-center rounded-3xl text-emerald-600 ring-1 dark:text-emerald-400">
					<Sparkles className="size-9" />
				</div>

				<div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 py-1.5 pr-4 pl-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
					<span className="relative flex size-2">
						<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
						<span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
					</span>
					Available to register
				</div>

				<h2 className="text-foreground font-display mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					This domain is up for grabs
				</h2>

				<p className="text-muted-foreground mt-5 text-base/relaxed text-balance">
					WHOIS shows no active registration, so there is nothing to dig up yet. That also means it
					is still free to claim, so grab it before someone else does.
				</p>

				{primary && (
					<div className="mt-9 flex w-full flex-col items-center gap-4">
						<Button
							asChild
							size="lg"
							className="h-12 bg-emerald-600 px-7 text-base font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
						>
							<a
								href={buildRegistrarUrl(primary.href, domain)}
								target="_blank"
								rel="nofollow sponsored noopener"
							>
								Register at {primary.name}
								<ArrowUpRight
									data-icon="inline-end"
									className="transition-transform group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5"
								/>
							</a>
						</Button>

						{primary.note && <p className="text-muted-foreground text-xs">{primary.note}</p>}

						{secondary.length > 0 && (
							<div className="mt-2 flex flex-col items-center gap-3">
								<span className="text-muted-foreground/80 text-xs tracking-wide uppercase">
									or register at
								</span>
								<div className="flex flex-wrap justify-center gap-2.5">
									{secondary.map(registrar => (
										<Button key={registrar.name} asChild variant="outline" size="sm">
											<a
												href={buildRegistrarUrl(registrar.href, domain)}
												target="_blank"
												rel="nofollow sponsored noopener"
											>
												{registrar.name}
												<ArrowUpRight data-icon="inline-end" />
											</a>
										</Button>
									))}
								</div>
							</div>
						)}

						<p className="text-muted-foreground/60 mt-1 text-[11px]">
							Affiliate link. We may earn a commission at no extra cost to you.
						</p>
					</div>
				)}

				<p className="text-muted-foreground/80 mt-10 flex items-center justify-center gap-1.5 text-xs">
					<Globe className="size-3.5" />
					Availability is based on WHOIS and can lag behind the registry.
				</p>
			</div>
		</section>
	);
};

export default DomainNotRegistered;
