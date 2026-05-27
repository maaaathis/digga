'use client';

import { ScanSearch } from 'lucide-react';
import { type FC, type ReactNode, useState } from 'react';

import IpDetailsModal from '@/components/lookup/ip-details-modal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type IpLinkProps = {
	ip: string;
	children?: ReactNode;
	className?: string;
};

const IpLink: FC<IpLinkProps> = ({ ip, children, className }) => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => {
							trackEvent('ip-inspect', { ip });
							setOpen(true);
						}}
						className={cn(
							'group/ip hover:text-foreground inline-flex items-center gap-1 underline decoration-dotted decoration-1 underline-offset-4 transition-colors hover:decoration-solid',
							className,
						)}
					>
						{children ?? ip}
						<ScanSearch className="size-3 shrink-0 opacity-50 transition-opacity group-hover/ip:opacity-100" />
					</button>
				</TooltipTrigger>
				<TooltipContent side="top">Inspect IP · ASN, org & location</TooltipContent>
			</Tooltip>
			<IpDetailsModal ip={ip} open={open} onOpenChange={setOpen} />
		</>
	);
};

export default IpLink;
