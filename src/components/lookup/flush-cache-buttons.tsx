'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getTLD } from '@/lib/domain';

type FlushCacheButtonsProps = {
	domain: string;
};

const FlushCacheButtons: FC<FlushCacheButtonsProps> = ({ domain }) => {
	const tld = getTLD(domain) ?? undefined;
	const targets = [
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
				<Button variant="outline" size="sm" className="gap-2 rounded-lg">
					Flush cache
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
				<DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
					Open the resolver page to purge
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{targets.map(target => (
					<DropdownMenuItem key={target.label} asChild>
						<Link
							href={target.href}
							target="_blank"
							rel="noreferrer noopener"
							className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2"
							data-umami-event="flush-cache"
							data-umami-event-resolver={target.label}
							data-umami-event-domain={domain}
							data-umami-event-tld={tld}
						>
							<span className="text-sm">{target.label}</span>
							<ExternalLink className="size-3.5 opacity-60" />
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default FlushCacheButtons;
