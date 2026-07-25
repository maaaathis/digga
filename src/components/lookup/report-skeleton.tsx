import type { FC } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const Label: FC<{ className?: string }> = ({ className }) => (
	<Skeleton className={cn('h-3 w-24 rounded-md', className)} />
);

const SectionBlock: FC<{ rows?: number; className?: string }> = ({ rows = 3, className }) => (
	<div className={cn('py-2', className)}>
		<div className="mb-4 flex items-center gap-2.5">
			<Skeleton className="size-7 rounded-lg" />
			<Label />
		</div>
		<div className="space-y-1.5">
			{Array.from({ length: rows }).map((_, index) => (
				<Skeleton key={index} className="h-9 w-full rounded-lg" />
			))}
		</div>
	</div>
);

const CardBlock: FC<{ rows?: number }> = ({ rows = 4 }) => (
	<div className="border-border/60 bg-card/60 rounded-2xl border p-5">
		<div className="mb-4 flex items-center gap-2.5">
			<Skeleton className="size-7 rounded-lg" />
			<Label className="w-32" />
		</div>
		<div className="space-y-2.5">
			{Array.from({ length: rows }).map((_, index) => (
				<div key={index} className="flex items-center justify-between gap-4">
					<Skeleton className="h-3 w-20 rounded-md" />
					<Skeleton className="h-3 w-28 rounded-md" />
				</div>
			))}
		</div>
	</div>
);

export const OverviewSkeleton: FC = () => (
	<div className="space-y-12" aria-hidden>
		<ul className="border-border/60 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] overflow-hidden rounded-2xl border">
			{Array.from({ length: 4 }).map((_, index) => (
				<li
					key={index}
					className="border-border/60 bg-card/40 flex flex-col gap-2 border-r border-b p-4"
				>
					<Skeleton className="h-3 w-16 rounded-md" />
					<Skeleton className="h-4 w-24 rounded-md" />
				</li>
			))}
		</ul>

		<div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[1.1fr_1fr]">
			<div className="space-y-10">
				<SectionBlock rows={2} />
				<SectionBlock rows={1} />
				<SectionBlock rows={2} />
			</div>
			<div className="space-y-10">
				<CardBlock rows={3} />
				<CardBlock rows={3} />
				<CardBlock rows={2} />
			</div>
		</div>
	</div>
);

export const TableSkeleton: FC<{ rows?: number }> = ({ rows = 10 }) => (
	<div className="space-y-4" aria-hidden>
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<Skeleton className="h-9 w-52 rounded-lg" />
			<div className="flex items-center gap-2">
				<Skeleton className="h-8 w-32 rounded-lg" />
				<Skeleton className="h-8 w-24 rounded-lg" />
				<Skeleton className="size-8 rounded-lg" />
			</div>
		</div>
		<div className="border-border/60 bg-card divide-border/60 divide-y overflow-hidden rounded-2xl border shadow-sm">
			<div className="flex items-center gap-4 px-5 py-3">
				<Skeleton className="h-3 w-16 rounded-md" />
				<Skeleton className="h-3 w-24 rounded-md" />
				<Skeleton className="ml-auto h-3 w-10 rounded-md" />
			</div>
			{Array.from({ length: rows }).map((_, index) => (
				<div key={index} className="flex items-center gap-4 px-5 py-3">
					<Skeleton className="h-3 w-32 rounded-md" />
					<Skeleton
						className="h-3 flex-1 rounded-md"
						style={{ maxWidth: `${40 + (index % 4) * 12}%` }}
					/>
					<Skeleton className="ml-auto h-3 w-8 rounded-md" />
				</div>
			))}
		</div>
	</div>
);

export const SectionsSkeleton: FC<{ cards?: number }> = ({ cards = 3 }) => (
	<div className="space-y-6" aria-hidden>
		{Array.from({ length: cards }).map((_, index) => (
			<CardBlock key={index} rows={index === 0 ? 5 : 3} />
		))}
	</div>
);
