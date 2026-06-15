'use client';

import naturalCompare from 'natural-compare-lite';
import { type FC, Fragment } from 'react';

import CopyButton from '@/components/copy-button';
import IpLink from '@/components/lookup/ip-link';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ResolvedRecords } from '@/lib/dns/types';
import { RECORD_TYPES } from '@/lib/dns/types';

type DnsTableProps = {
	records: ResolvedRecords;
};

function formatTtl(ttl: number): string {
	if (ttl < 60) return `${ttl}s`;
	if (ttl < 3600) return `${Math.round(ttl / 60)}m`;
	if (ttl < 86_400) return `${Math.round(ttl / 3600)}h`;
	return `${Math.round(ttl / 86_400)}d`;
}

const DnsTable: FC<DnsTableProps> = ({ records }) => {
	const sections = RECORD_TYPES.filter(type => records[type].length > 0);

	if (sections.length === 0) {
		return (
			<p className="text-muted-foreground py-12 text-center text-sm">
				No DNS records found for this domain with the selected resolver.
			</p>
		);
	}

	return (
		<div className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="pl-5">Name</TableHead>
						<TableHead>Value</TableHead>
						<TableHead className="w-24 pr-5 text-right">TTL</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sections.map(type => {
						const items = [...records[type]].sort((a, b) => naturalCompare(a.data, b.data));
						return (
							<Fragment key={type}>
								<TableRow className="hover:bg-transparent">
									<TableCell colSpan={3} className="bg-muted/30 px-5 py-2">
										<div className="flex items-center justify-between">
											<span className="bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-xs">
												{type}
											</span>
											<span className="text-muted-foreground text-[11px] tracking-wide uppercase">
												{items.length} {items.length === 1 ? 'record' : 'records'}
											</span>
										</div>
									</TableCell>
								</TableRow>
								{items.map((record, index) => (
									<TableRow key={`${type}-${record.name}-${record.data}-${index}`}>
										<TableCell className="text-muted-foreground pl-5 font-mono text-xs whitespace-nowrap">
											{record.name}
										</TableCell>
										<TableCell className="font-mono text-xs whitespace-normal">
											<div className="group flex items-center gap-2">
												{type === 'A' || type === 'AAAA' ? (
													<IpLink ip={record.data} className="break-all" />
												) : record.raw ? (
													<Tooltip>
														<TooltipTrigger asChild>
															<span className="decoration-muted-foreground/40 cursor-help break-all underline decoration-dotted underline-offset-2">
																{record.data}
															</span>
														</TooltipTrigger>
														<TooltipContent side="bottom" className="max-w-xs font-mono">
															<span className="text-background/60">Raw</span>
															<span className="break-all">{record.raw}</span>
														</TooltipContent>
													</Tooltip>
												) : (
													<span className="break-all">{record.data}</span>
												)}
												<CopyButton
													value={record.data}
													className="opacity-0 group-hover:opacity-100"
												/>
												{record.raw && (
													<CopyButton
														value={record.raw}
														size="sm"
														label="raw"
														className="text-muted-foreground h-7 px-2 opacity-0 group-hover:opacity-100"
													/>
												)}
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground pr-5 text-right font-mono text-xs">
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="decoration-muted-foreground/40 cursor-help underline decoration-dotted underline-offset-2">
														{formatTtl(record.TTL)}
													</span>
												</TooltipTrigger>
												<TooltipContent side="left" className="font-mono">
													{record.TTL.toLocaleString('en-US')}{' '}
													{record.TTL === 1 ? 'second' : 'seconds'}
												</TooltipContent>
											</Tooltip>
										</TableCell>
									</TableRow>
								))}
							</Fragment>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};

export default DnsTable;
