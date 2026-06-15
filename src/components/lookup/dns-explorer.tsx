'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { type FC, useState } from 'react';
import useSWR from 'swr';

import DnsActionsMenu from '@/components/lookup/dns-actions-menu';
import DnsPropagation from '@/components/lookup/dns-propagation';
import DnsTable from '@/components/lookup/dns-table';
import ResolverSelect from '@/components/lookup/resolver-select';
import SegmentedTabs from '@/components/lookup/segmented-tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { trackEvent } from '@/lib/analytics';
import { resolveAllRecords } from '@/lib/dns/doh';
import { EMPTY_RECORDS, type ResolvedRecords, type ResolverId } from '@/lib/dns/types';
import { getTLD } from '@/lib/domain';

type DnsExplorerProps = {
	domain: string;
	initialResolver: ResolverId;
	initialRecords: ResolvedRecords;
};

type SwrKey = readonly [string, string, ResolverId];

const fetcher = async ([, domain, resolver]: SwrKey) => resolveAllRecords(resolver, domain);

type DnsView = 'records' | 'propagation';

const DnsExplorer: FC<DnsExplorerProps> = ({ domain, initialResolver, initialRecords }) => {
	const [view, setView] = useState<DnsView>('records');
	const [resolver, setResolver] = useState<ResolverId>(initialResolver);

	const onViewChange = (next: DnsView) => {
		trackEvent('dns-view', { view: next, domain, tld: getTLD(domain) ?? undefined });
		setView(next);
	};

	const onResolverChange = (next: ResolverId) => {
		trackEvent('dns-resolver', { resolver: next, domain, tld: getTLD(domain) ?? undefined });
		setResolver(next);
	};

	const { data, error, isLoading, isValidating, mutate } = useSWR<ResolvedRecords, Error, SwrKey>(
		['dns', domain, resolver],
		fetcher,
		{
			fallbackData: resolver === initialResolver ? initialRecords : undefined,
			revalidateOnMount: false,
			revalidateOnFocus: false,
			keepPreviousData: true,
		},
	);

	const records = data ?? EMPTY_RECORDS;
	const showSkeleton = isLoading && !data;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SegmentedTabs
					ariaLabel="DNS view"
					value={view}
					onChange={onViewChange}
					options={[
						{ value: 'records', label: 'Records' },
						{ value: 'propagation', label: 'Propagation' },
					]}
				/>

				{view === 'records' && (
					<div className="flex flex-wrap items-center gap-2">
						{isValidating && !showSkeleton ? (
							<span className="text-muted-foreground mr-1 flex items-center gap-1.5 text-xs">
								<Loader2 className="size-3 animate-spin" />
								Resolving
							</span>
						) : null}
						<ResolverSelect value={resolver} onChange={onResolverChange} />
						<Button
							variant="outline"
							size="sm"
							onClick={() => mutate()}
							disabled={isLoading || isValidating}
							className="gap-2 rounded-lg"
						>
							<RefreshCw className="size-4" />
							Refresh
						</Button>
						<DnsActionsMenu domain={domain} />
					</div>
				)}
			</div>

			{view === 'propagation' ? (
				<DnsPropagation domain={domain} />
			) : showSkeleton ? (
				<div className="space-y-2">
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton key={index} className="h-10 w-full rounded-lg" />
					))}
				</div>
			) : error ? (
				<p className="text-destructive py-12 text-center text-sm">
					Resolver failed. Switch resolver or retry.
				</p>
			) : (
				<DnsTable records={records} />
			)}
		</div>
	);
};

export default DnsExplorer;
