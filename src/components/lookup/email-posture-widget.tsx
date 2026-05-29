import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

import Widget from '@/components/lookup/widget';
import type { CheckStatus, EmailCheck } from '@/lib/email-security';
import { cn } from '@/lib/utils';

const STATUS_DOT: Record<CheckStatus, string> = {
	pass: 'bg-emerald-500',
	warn: 'bg-amber-500',
	fail: 'bg-red-500',
	none: 'bg-muted-foreground/40',
};

const STATUS_LABEL: Record<CheckStatus, string> = {
	pass: 'Pass',
	warn: 'Warning',
	fail: 'Missing',
	none: 'Not set',
};

const Row: FC<{ check: EmailCheck }> = ({ check }) => (
	<div className="flex items-center justify-between gap-3 py-2">
		<div className="min-w-0">
			<p className="text-foreground text-sm font-medium">{check.title}</p>
			<p className="text-muted-foreground truncate text-xs">{check.summary}</p>
		</div>
		<span className="text-muted-foreground inline-flex shrink-0 items-center gap-1.5 text-xs">
			<span aria-hidden className={cn('size-2 rounded-full', STATUS_DOT[check.status])} />
			{STATUS_LABEL[check.status]}
		</span>
	</div>
);

const EmailPostureWidget: FC<{ domain: string; spf: EmailCheck; dmarc: EmailCheck }> = ({
	domain,
	spf,
	dmarc,
}) => (
	<Widget
		variant="section"
		title="Email security"
		icon={<ShieldCheck className="size-3.5" />}
		action={
			<Link
				href={`/lookup/${domain}/email`}
				prefetch
				className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
			>
				Full report
				<ArrowUpRight className="size-3.5" />
			</Link>
		}
	>
		<div className="divide-border/60 divide-y">
			<Row check={spf} />
			<Row check={dmarc} />
		</div>
	</Widget>
);

export default EmailPostureWidget;
