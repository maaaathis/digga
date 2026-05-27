import { Globe } from 'lucide-react';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import CopyButton from '@/components/copy-button';
import IpLink from '@/components/lookup/ip-link';
import ProviderBadge from '@/components/lookup/provider-badge';
import Widget from '@/components/lookup/widget';
import type { RawRecord } from '@/lib/dns/types';
import type { MailProvider } from '@/lib/mail-provider';

type DnsSummaryWidgetProps = {
	title: string;
	type: string;
	domain: string;
	records: RawRecord[];
	icon?: ReactNode;
	emptyText?: string;
	ipOrgMap?: Record<string, string>;
	provider?: MailProvider | null;
};

const DnsSummaryWidget: FC<DnsSummaryWidgetProps> = ({
	title,
	type,
	domain,
	records,
	icon,
	emptyText,
	ipOrgMap,
	provider,
}) => {
	return (
		<Widget
			variant="section"
			title={title}
			icon={icon ?? <Globe className="size-3.5" />}
			action={
				<Link
					href={`/lookup/${domain}/dns`}
					className="text-muted-foreground hover:text-foreground font-mono text-xs"
				>
					{type}
				</Link>
			}
		>
			{provider ? (
				<ProviderBadge name={provider.name} domain={provider.domain} label="Mail provider" />
			) : null}
			{records.length === 0 ? (
				<p className="text-muted-foreground text-sm">{emptyText ?? 'No records found.'}</p>
			) : (
				<ul className="space-y-1.5">
					{records.slice(0, 6).map((record, index) => {
						const org = ipOrgMap?.[record.data];
						const isIp = type === 'A' || type === 'AAAA';
						return (
							<li
								key={`${record.name}-${record.data}-${index}`}
								className="bg-muted/40 hover:bg-muted/60 flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-mono text-xs transition-colors"
							>
								<span className="min-w-0 truncate">
									{isIp ? <IpLink ip={record.data}>{record.data}</IpLink> : record.data}
									{org ? (
										<span className="text-muted-foreground ml-2 font-sans text-[11px]">{org}</span>
									) : null}
								</span>
								<CopyButton value={record.data} />
							</li>
						);
					})}
					{records.length > 6 ? (
						<li className="text-muted-foreground pt-1 text-center text-xs">
							and {records.length - 6} more.{' '}
							<Link
								href={`/lookup/${domain}/dns`}
								className="hover:text-foreground underline-offset-4 hover:underline"
							>
								See all
							</Link>
						</li>
					) : null}
				</ul>
			)}
		</Widget>
	);
};

export default DnsSummaryWidget;
