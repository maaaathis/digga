'use client';

import { type FC, type ReactNode, useState } from 'react';

import IpDetailsModal from '@/components/lookup/ip-details-modal';
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
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={cn(
					'hover:text-foreground inline-flex items-center underline decoration-dotted decoration-1 underline-offset-4 transition-colors hover:decoration-solid',
					className,
				)}
			>
				{children ?? ip}
			</button>
			<IpDetailsModal ip={ip} open={open} onOpenChange={setOpen} />
		</>
	);
};

export default IpLink;
