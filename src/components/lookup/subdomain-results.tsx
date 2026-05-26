'use client';

import naturalCompare from 'natural-compare-lite';
import { ArrowUpDown, ArrowUpRight, Download, Radio, Search } from 'lucide-react';
import Link from 'next/link';
import { type FC, useMemo, useState } from 'react';

import CopyButton from '@/components/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type LiveStatus = 'unknown' | 'checking' | 'live' | 'dead';

type SubdomainResultsProps = {
	domain: string;
	subdomains: string[];
	tookMs: number;
};

type SortMode = 'name' | 'depth';

function splitPrefix(sub: string, base: string): { prefix: string; rest: string } {
	if (sub === base) return { prefix: '', rest: sub };
	const suffix = `.${base}`;
	if (sub.endsWith(suffix)) {
		return { prefix: sub.slice(0, -suffix.length), rest: suffix };
	}
	return { prefix: '', rest: sub };
}

function depthOf(sub: string): number {
	return sub.split('.').length;
}

async function pool<T>(
	items: T[],
	limit: number,
	worker: (item: T) => Promise<void>,
): Promise<void> {
	let cursor = 0;
	const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (cursor < items.length) {
			const index = cursor;
			cursor += 1;
			await worker(items[index]);
		}
	});
	await Promise.all(runners);
}

// Fire a real request at the host from the browser. Cross-origin responses are
// opaque (mode: 'no-cors'), so we cannot read the status code — but a resolved
// promise means a server answered, while a throw means DNS/connection/TLS
// failure or a timeout. That is enough to tell reachable hosts from dead ones.
async function probeHost(host: string): Promise<boolean> {
	try {
		await fetch(`https://${host}/`, {
			method: 'HEAD',
			mode: 'no-cors',
			cache: 'no-store',
			redirect: 'follow',
			signal: AbortSignal.timeout(5000),
		});
		return true;
	} catch {
		return false;
	}
}

const SubdomainResults: FC<SubdomainResultsProps> = ({ domain, subdomains, tookMs }) => {
	const [filter, setFilter] = useState('');
	const [sort, setSort] = useState<SortMode>('name');
	const [status, setStatus] = useState<Record<string, LiveStatus>>({});
	const [checking, setChecking] = useState(false);

	const sorted = useMemo(() => {
		const list = [...subdomains];
		if (sort === 'name') return list.sort(naturalCompare);
		return list.sort((a, b) => depthOf(a) - depthOf(b) || naturalCompare(a, b));
	}, [subdomains, sort]);

	const filtered = useMemo(() => {
		const needle = filter.trim().toLowerCase();
		if (!needle) return sorted;
		return sorted.filter(sub => sub.includes(needle));
	}, [sorted, filter]);

	const liveCount = useMemo(
		() => Object.values(status).filter(value => value === 'live').length,
		[status],
	);

	const onCheckLive = async () => {
		setChecking(true);
		setStatus(Object.fromEntries(subdomains.map(sub => [sub, 'checking' as LiveStatus])));
		await pool(subdomains, 10, async sub => {
			const live = await probeHost(sub);
			setStatus(prev => ({ ...prev, [sub]: live ? 'live' : 'dead' }));
		});
		setChecking(false);
	};

	const onDownload = () => {
		const blob = new Blob([subdomains.join('\n') + '\n'], {
			type: 'text/plain',
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${domain}-subdomains.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const checked = Object.keys(status).length > 0;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-muted-foreground text-sm">
					<span className="text-foreground font-semibold">
						{subdomains.length.toLocaleString()}
					</span>{' '}
					subdomains in {(tookMs / 1000).toFixed(1)}s
					{checked ? (
						<>
							{' · '}
							<span className="text-emerald-600 dark:text-emerald-400">
								{liveCount.toLocaleString()} live
							</span>
						</>
					) : null}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<div className="relative">
						<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
						<Input
							value={filter}
							onChange={event => setFilter(event.target.value)}
							placeholder="Filter"
							className="h-9 w-44 rounded-lg pl-8 font-mono text-xs"
						/>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setSort(mode => (mode === 'name' ? 'depth' : 'name'))}
						className="gap-1.5 rounded-lg"
					>
						<ArrowUpDown className="size-3.5" />
						{sort === 'name' ? 'Name' : 'Depth'}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onCheckLive}
						disabled={checking}
						className="gap-1.5 rounded-lg"
					>
						<Radio className={cn('size-3.5', checking && 'animate-pulse')} />
						{checking ? 'Checking' : 'Check live'}
					</Button>
					<Button variant="outline" size="sm" onClick={onDownload} className="gap-1.5 rounded-lg">
						<Download className="size-3.5" />
						Export
					</Button>
				</div>
			</div>

			<ul className="border-border/60 divide-border/50 divide-y overflow-hidden rounded-2xl border">
				{filtered.map(sub => {
					const { prefix, rest } = splitPrefix(sub, domain);
					const state = status[sub] ?? 'unknown';
					return (
						<li
							key={sub}
							className="group bg-card/40 hover:bg-card flex items-center gap-3 px-4 py-2.5 transition-colors"
						>
							<StatusDot state={state} />
							<Link href={`/lookup/${sub}`} className="min-w-0 flex-1 truncate font-mono text-sm">
								<span className="text-foreground font-medium">{prefix}</span>
								<span className="text-muted-foreground">{rest}</span>
							</Link>
							<CopyButton value={sub} className="opacity-0 group-hover:opacity-100" />
							<Link
								href={`/lookup/${sub}`}
								className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
								aria-label={`Look up ${sub}`}
							>
								<ArrowUpRight className="size-4" />
							</Link>
						</li>
					);
				})}
				{filtered.length === 0 ? (
					<li className="text-muted-foreground py-12 text-center text-sm">
						No matches for {`"${filter}"`}.
					</li>
				) : null}
			</ul>
		</div>
	);
};

const StatusDot: FC<{ state: LiveStatus }> = ({ state }) => {
	const map: Record<LiveStatus, string> = {
		unknown: 'bg-muted-foreground/30',
		checking: 'bg-amber-400 animate-pulse',
		live: 'bg-emerald-500',
		dead: 'bg-muted-foreground/30',
	};
	const label: Record<LiveStatus, string> = {
		unknown: 'not checked',
		checking: 'checking',
		live: 'responds over HTTPS',
		dead: 'no response',
	};
	return (
		<span
			className={cn('size-2 shrink-0 rounded-full', map[state])}
			title={label[state]}
			aria-label={label[state]}
		/>
	);
};

export default SubdomainResults;
