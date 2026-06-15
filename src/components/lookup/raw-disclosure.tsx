'use client';

import { ChevronRight } from 'lucide-react';
import { type FC, useState } from 'react';

import CopyButton from '@/components/copy-button';
import { cn } from '@/lib/utils';

type RawDisclosureProps = {
	label: string;
	value: string;
};

const RawDisclosure: FC<RawDisclosureProps> = ({ label, value }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="border-border/60 border-t">
			<div className="flex items-center justify-between gap-2 px-5 py-3">
				<button
					type="button"
					onClick={() => setOpen(previous => !previous)}
					aria-expanded={open}
					className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
				>
					<ChevronRight className={cn('size-4 transition-transform', open && 'rotate-90')} />
					{label}
				</button>
				<CopyButton value={value} />
			</div>
			{open ? (
				<pre className="overflow-x-auto px-5 pb-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
					{value}
				</pre>
			) : null}
		</div>
	);
};

export default RawDisclosure;
