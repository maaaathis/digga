import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import type { DomainTakeover, TakeoverKind } from '@/lib/domain-takeover';
import { cn } from '@/lib/utils';

type TakeoverBannerProps = {
	domain: string;
	takeover: DomainTakeover;
};

const TONE: Record<TakeoverKind, { card: string; glow: string }> = {
	seizure: {
		card: 'border-red-500/30 bg-red-500/[0.07]',
		glow: 'bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,color-mix(in_oklab,var(--color-red-500)_14%,transparent),transparent_72%)]',
	},
	sinkhole: {
		card: 'border-amber-500/30 bg-amber-500/[0.07]',
		glow: 'bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,color-mix(in_oklab,var(--color-amber-500)_14%,transparent),transparent_72%)]',
	},
};

function headline(domain: string, takeover: DomainTakeover): string {
	return takeover.kind === 'seizure'
		? `${domain} has been seized by ${takeover.operator}`
		: `${domain} is sinkholed by ${takeover.operator}`;
}

function body(takeover: DomainTakeover): ReactNode {
	if (takeover.kind === 'seizure') {
		return (
			<>
				The domain is delegated to law enforcement nameservers, so its DNS is run by{' '}
				{takeover.operatorLongName}, not by the original owner. Whatever the domain still serves is
				a seizure notice rather than the site it used to be.
			</>
		);
	}
	return (
		<>
			The domain is delegated to sinkhole nameservers run by {takeover.operatorLongName}. Traffic
			that used to reach the original operator now lands there instead, which is what happens to
			botnet domains after a court order or a coordinated takedown. Any machine still calling this
			domain is likely infected.
		</>
	);
}

const TakeoverBanner: FC<TakeoverBannerProps> = ({ domain, takeover }) => (
	<section
		className={cn(
			'relative overflow-hidden rounded-2xl border p-5 sm:p-6',
			TONE[takeover.kind].card,
		)}
	>
		<div
			aria-hidden
			className={cn('pointer-events-none absolute inset-x-0 top-0 h-40', TONE[takeover.kind].glow)}
		/>

		<div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
			<Image
				src={takeover.logo}
				alt={`Logo of ${takeover.operator}`}
				width={96}
				height={96}
				className="size-12 shrink-0 object-contain"
				draggable={false}
			/>

			<div className="min-w-0 flex-1">
				<h2 className="font-display text-foreground text-xl font-semibold tracking-tight text-balance sm:text-2xl">
					{headline(domain, takeover)}
				</h2>
				<p className="text-muted-foreground mt-2 text-sm/relaxed">{body(takeover)}</p>

				<Link
					href={`https://${takeover.domain}`}
					prefetch={false}
					target="_blank"
					rel="noreferrer noopener"
					className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-1.5 text-xs transition-colors"
					data-umami-event="visit-takeover-operator"
					data-umami-event-domain={domain}
					data-umami-event-kind={takeover.kind}
				>
					{takeover.domain}
					<ExternalLink className="size-3" />
				</Link>
			</div>
		</div>
	</section>
);

export default TakeoverBanner;
