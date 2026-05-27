import type { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type StateNoticeTone = 'positive' | 'neutral' | 'warning' | 'error';

const TONE: Record<StateNoticeTone, { icon: string; glow: string }> = {
	positive: {
		icon: 'text-emerald-600 dark:text-emerald-400',
		glow: 'bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,color-mix(in_oklab,var(--color-emerald-500)_16%,transparent),transparent_72%)]',
	},
	neutral: {
		icon: 'text-muted-foreground',
		glow: 'bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,color-mix(in_oklab,var(--foreground)_7%,transparent),transparent_72%)]',
	},
	warning: {
		icon: 'text-amber-600 dark:text-amber-400',
		glow: 'bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,color-mix(in_oklab,var(--color-amber-500)_15%,transparent),transparent_72%)]',
	},
	error: {
		icon: 'text-destructive',
		glow: 'bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,color-mix(in_oklab,var(--destructive)_13%,transparent),transparent_72%)]',
	},
};

type StateNoticeProps = {
	/** Drives the accent color of the icon and the glow behind it. */
	tone?: StateNoticeTone;
	/** Pre-sized lucide icon, e.g. `<Sparkles className="size-9" />`. */
	icon: ReactNode;
	title: ReactNode;
	/** Heading level. Pages that own the document title should pass `h1`. */
	titleAs?: 'h1' | 'h2';
	/** Optional pill rendered above the title (e.g. a status badge). */
	badge?: ReactNode;
	description?: ReactNode;
	/** Actions / CTA row, rendered centered below the description. */
	children?: ReactNode;
	/** Small muted line pinned to the bottom (disclaimers, hints). */
	footnote?: ReactNode;
	className?: string;
};

const StateNotice: FC<StateNoticeProps> = ({
	tone = 'neutral',
	icon,
	title,
	titleAs: TitleTag = 'h2',
	badge,
	description,
	children,
	footnote,
	className,
}) => (
	<section
		className={cn(
			'bg-card border-border/60 ring-soft surface-blur relative w-full overflow-hidden rounded-3xl border px-6 py-20 sm:px-10 sm:py-24',
			className,
		)}
	>
		{/* soft glow behind the icon */}
		<div
			aria-hidden
			className={cn('pointer-events-none absolute inset-x-0 top-0 h-64', TONE[tone].glow)}
		/>

		<div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
			<div
				className={cn(
					'ring-border/60 bg-card inline-flex size-20 items-center justify-center rounded-3xl ring-1',
					TONE[tone].icon,
				)}
			>
				{icon}
			</div>

			{badge && <div className="mt-8">{badge}</div>}

			<TitleTag
				className={cn(
					'text-foreground font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl',
					badge ? 'mt-6' : 'mt-7',
				)}
			>
				{title}
			</TitleTag>

			{description && (
				<p className="text-muted-foreground mt-5 text-base/relaxed text-balance">{description}</p>
			)}

			{children && <div className="mt-9 flex w-full flex-col items-center gap-4">{children}</div>}

			{footnote && (
				<div className="text-muted-foreground/80 mt-10 flex items-center justify-center gap-1.5 text-xs">
					{footnote}
				</div>
			)}
		</div>
	</section>
);

export default StateNotice;
