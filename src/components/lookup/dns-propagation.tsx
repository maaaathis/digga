'use client';

import { Check, Loader2, Minus, RefreshCw, X } from 'lucide-react';
import { type FC, useState } from 'react';
import useSWR from 'swr';

import SegmentedTabs from '@/components/lookup/segmented-tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { trackEvent } from '@/lib/analytics';
import {
	checkPropagation,
	PROPAGATION_RESOLVERS,
	type PropagationReport,
	PROPAGATION_TYPES,
	type PropagationType,
	type ResolverOutcome,
} from '@/lib/dns/propagation';
import { getTLD } from '@/lib/domain';
import { cn } from '@/lib/utils';

type DnsPropagationProps = {
	domain: string;
};

type SwrKey = readonly ['dns-propagation', string, PropagationType];

const fetcher = ([, domain, type]: SwrKey) => checkPropagation(domain, type);

function formatTtl(ttl: number): string {
	if (ttl < 60) return `${ttl}s`;
	if (ttl < 3600) return `${Math.round(ttl / 60)}m`;
	if (ttl < 86_400) return `${Math.round(ttl / 3600)}h`;
	return `${Math.round(ttl / 86_400)}d`;
}

const DnsPropagation: FC<DnsPropagationProps> = ({ domain }) => {
	const [type, setType] = useState<PropagationType>('A');

	const { data, isLoading, isValidating, mutate } = useSWR<PropagationReport, Error, SwrKey>(
		['dns-propagation', domain, type],
		fetcher,
		{ revalidateOnFocus: false, keepPreviousData: true },
	);

	const onTypeChange = (next: PropagationType) => {
		trackEvent('dns-propagation', { type: next, domain, tld: getTLD(domain) ?? undefined });
		setType(next);
	};

	const showSkeleton = isLoading && !data;
	const consensusKey = data?.consensusKey ?? null;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SegmentedTabs
					ariaLabel="Record type"
					value={type}
					onChange={onTypeChange}
					options={PROPAGATION_TYPES.map(value => ({ value, label: value }))}
				/>
				<Button
					variant="outline"
					size="sm"
					onClick={() => mutate()}
					disabled={isValidating}
					className="gap-2 rounded-lg"
				>
					<RefreshCw className={cn('size-4', isValidating && 'animate-spin')} />
					Recheck
				</Button>
			</div>

			{showSkeleton ? (
				<div className="space-y-2">
					{PROPAGATION_RESOLVERS.map(resolver => (
						<Skeleton key={resolver.id} className="h-16 w-full rounded-xl" />
					))}
				</div>
			) : data ? (
				<>
					<ConsensusBanner report={data} />
					<ul className="space-y-2">
						{data.outcomes.map(outcome => (
							<ResolverRow key={outcome.id} outcome={outcome} consensusKey={consensusKey} />
						))}
					</ul>
					<p className="text-muted-foreground text-xs">
						Queried directly from your browser across {PROPAGATION_RESOLVERS.length} independent
						public resolvers. These are anycast services, so this checks operator agreement, not
						geographic propagation.
					</p>
				</>
			) : null}
		</div>
	);
};

const ConsensusBanner: FC<{ report: PropagationReport }> = ({ report }) => {
	const { propagated, responders, agree, consensus } = report;

	const tone = responders === 0 ? 'error' : propagated ? 'positive' : 'warning';
	const styles = {
		positive: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
		warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
		error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
	}[tone];

	const headline =
		responders === 0
			? 'No resolver responded'
			: propagated
				? consensus && consensus.length > 0
					? `Propagated · all ${responders} resolvers agree`
					: `Consistent · all ${responders} resolvers report no records`
				: `Propagating · ${agree}/${responders} resolvers agree`;

	const Icon = tone === 'positive' ? Check : tone === 'warning' ? Loader2 : X;

	return (
		<div className={cn('flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm', styles)}>
			<Icon className={cn('size-4 shrink-0', tone === 'warning' && 'animate-spin')} />
			<span className="font-medium">{headline}</span>
		</div>
	);
};

const ResolverRow: FC<{ outcome: ResolverOutcome; consensusKey: string | null }> = ({
	outcome,
	consensusKey,
}) => {
	const isError = outcome.status === 'error';
	const matches = !isError && outcome.matchKey === consensusKey;

	const dot = isError ? 'bg-muted-foreground/40' : matches ? 'bg-emerald-500' : 'bg-amber-500';

	return (
		<li className="border-border/60 bg-card/40 flex items-start justify-between gap-4 rounded-xl border px-4 py-3">
			<div className="flex min-w-0 items-center gap-3">
				<span className={cn('mt-0.5 size-2 shrink-0 rounded-full', dot)} aria-hidden />
				<div className="min-w-0">
					<p className="text-foreground text-sm font-medium">{outcome.label}</p>
					<p className="text-muted-foreground text-xs">{outcome.region}</p>
				</div>
			</div>
			<div className="min-w-0 text-right">
				{isError ? (
					<span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
						<Minus className="size-3" />
						no response
					</span>
				) : outcome.values.length === 0 ? (
					<span className="text-muted-foreground text-sm italic">no records</span>
				) : (
					<div className="space-y-0.5">
						{outcome.values.map(value => (
							<p key={value} className="text-foreground font-mono text-xs break-all">
								{value}
							</p>
						))}
						{outcome.ttl !== null ? (
							<p className="text-muted-foreground font-mono text-[11px]">
								ttl {formatTtl(outcome.ttl)}
							</p>
						) : null}
					</div>
				)}
			</div>
		</li>
	);
};

export default DnsPropagation;
