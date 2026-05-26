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
						<TableHead className="w-20 pl-5">Type</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Value</TableHead>
						<TableHead className="w-24 pr-5 text-right">TTL</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sections.map(type => {
						const items = [...records[type]].sort((a, b) => naturalCompare(a.data, b.data));
						return (
							<Fragment key={type}>
								{items.map((record, index) => (
									<TableRow key={`${type}-${record.name}-${record.data}-${index}`}>
										<TableCell className="pl-5 font-mono text-xs">
											<span className="bg-muted rounded-md px-1.5 py-0.5">{type}</span>
										</TableCell>
										<TableCell className="font-mono text-xs">{record.name}</TableCell>
										<TableCell className="font-mono text-xs">
											<div className="group flex items-center gap-2">
												{type === 'A' || type === 'AAAA' ? (
													<IpLink ip={record.data} className="break-all" />
												) : (
													<span className="break-all">{record.data}</span>
												)}
												<CopyButton
													value={record.data}
													className="opacity-0 group-hover:opacity-100"
												/>
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground pr-5 text-right font-mono text-xs">
											{formatTtl(record.TTL)}
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
