'use client';

import { ExternalLink, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getTLD } from '@/lib/domain';

type DnsActionsMenuProps = {
	domain: string;
};

const DnsActionsMenu: FC<DnsActionsMenuProps> = ({ domain }) => {
	const tld = getTLD(domain) ?? undefined;

	const flushTargets = [
		{
			label: 'Cloudflare (1.1.1.1)',
			href: `https://1.1.1.1/purge-cache/?domain=${encodeURIComponent(domain)}`,
		},
		{
			label: 'Google (8.8.8.8)',
			href: `https://developers.google.com/speed/public-dns/cache?domain=${encodeURIComponent(domain)}`,
		},
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon-sm"
					className="rounded-lg"
					aria-label="More DNS actions"
				>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-52 rounded-2xl">
				<DropdownMenuItem asChild>
					<Link
						href={`https://dnshistory.org/dns-records/${encodeURIComponent(domain)}`}
						target="_blank"
						rel="noreferrer noopener"
						className="cursor-pointer justify-between"
						data-umami-event="dns-history"
						data-umami-event-domain={domain}
						data-umami-event-tld={tld}
					>
						DNS history
						<ExternalLink className="size-3.5 opacity-60" />
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Flush cache</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="min-w-56 rounded-2xl">
						<DropdownMenuLabel className="font-normal">
							Open the resolver page to purge
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{flushTargets.map(target => (
							<DropdownMenuItem key={target.label} asChild>
								<Link
									href={target.href}
									target="_blank"
									rel="noreferrer noopener"
									className="cursor-pointer justify-between"
									data-umami-event="flush-cache"
									data-umami-event-resolver={target.label}
									data-umami-event-domain={domain}
									data-umami-event-tld={tld}
								>
									{target.label}
									<ExternalLink className="size-3.5 opacity-60" />
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default DnsActionsMenu;
