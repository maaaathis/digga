'use client';

import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { type FC, useState } from 'react';
import useSWR from 'swr';

import DnsTable from '@/components/lookup/dns-table';
import FlushCacheButtons from '@/components/lookup/flush-cache-buttons';
import ResolverTabs from '@/components/lookup/resolver-tabs';
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

const DnsExplorer: FC<DnsExplorerProps> = ({ domain, initialResolver, initialRecords }) => {
	const [resolver, setResolver] = useState<ResolverId>(initialResolver);

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
				<ResolverTabs value={resolver} onChange={onResolverChange} />
				<div className="text-muted-foreground flex items-center gap-2 text-xs">
					{isValidating && !showSkeleton ? (
						<span className="mr-1 flex items-center gap-1.5">
							<Loader2 className="size-3 animate-spin" />
							Resolving
						</span>
					) : null}
					<FlushCacheButtons domain={domain} />
					<Button asChild variant="outline" size="sm" className="gap-2 rounded-lg">
						<Link
							href={`https://dnshistory.org/dns-records/${encodeURIComponent(domain)}`}
							target="_blank"
							rel="noreferrer noopener"
							data-umami-event="dns-history"
							data-umami-event-domain={domain}
							data-umami-event-tld={getTLD(domain) ?? undefined}
						>
							DNS history
							<ExternalLink className="size-4" />
						</Link>
					</Button>
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
				</div>
			</div>

			{showSkeleton ? (
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
