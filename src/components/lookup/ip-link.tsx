'use client';

import { ScanSearch } from 'lucide-react';
import dynamic from 'next/dynamic';
import { type FC, type ReactNode, useState } from 'react';

import CountryFlag from '@/components/lookup/country-flag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { trackEvent } from '@/lib/analytics';
import type { IpCountry } from '@/lib/ip';
import { cn } from '@/lib/utils';

const IpDetailsModal = dynamic(() => import('@/components/lookup/ip-details-modal'), {
	ssr: false,
});

type IpLinkProps = {
	ip: string;
	children?: ReactNode;
	className?: string;
	/** Shown as a flag in front of the IP, so the location is visible without opening the modal. */
	country?: IpCountry | null;
};

const IpLink: FC<IpLinkProps> = ({ ip, children, className, country }) => {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => {
							trackEvent('ip-inspect', { ip });
							setMounted(true);
							setOpen(true);
						}}
						className={cn(
							'group/ip hover:text-foreground inline-flex items-center gap-1 underline decoration-dotted decoration-1 underline-offset-4 transition-colors hover:decoration-solid',
							className,
						)}
					>
						{country ? (
							<CountryFlag code={country.code} title={country.name} className="mr-0.5" />
						) : null}
						{children ?? ip}
						<ScanSearch className="size-3 shrink-0 opacity-50 transition-opacity group-hover/ip:opacity-100" />
					</button>
				</TooltipTrigger>
				<TooltipContent side="top">Inspect IP · ASN, org & location</TooltipContent>
			</Tooltip>
			{mounted ? <IpDetailsModal ip={ip} open={open} onOpenChange={setOpen} /> : null}
		</>
	);
};

export default IpLink;
