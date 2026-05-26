import { AlertTriangle, CheckCircle2, Minus, XCircle } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import CopyButton from '@/components/copy-button';
import type {
	CheckLevel,
	CheckStatus,
	EmailCheck,
	EmailSecurityReport,
} from '@/lib/email-security';
import { cn } from '@/lib/utils';

const STATUS_META: Record<
	CheckStatus,
	{ label: string; icon: ReactNode; badge: string; dot: string }
> = {
	pass: {
		label: 'Pass',
		icon: <CheckCircle2 className="size-4" />,
		badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
		dot: 'bg-emerald-500',
	},
	warn: {
		label: 'Warning',
		icon: <AlertTriangle className="size-4" />,
		badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
		dot: 'bg-amber-500',
	},
	fail: {
		label: 'Fail',
		icon: <XCircle className="size-4" />,
		badge: 'bg-red-500/15 text-red-700 dark:text-red-400',
		dot: 'bg-red-500',
	},
	none: {
		label: 'Not set',
		icon: <Minus className="size-4" />,
		badge: 'bg-muted text-muted-foreground',
		dot: 'bg-muted-foreground/50',
	},
};

const FINDING_DOT: Record<CheckLevel, string> = {
	pass: 'bg-emerald-500',
	warn: 'bg-amber-500',
	fail: 'bg-red-500',
	info: 'bg-muted-foreground/50',
};

const Summary: FC<{ report: EmailSecurityReport }> = ({ report }) => {
	const { tally } = report;
	const verdict =
		tally.fail > 0
			? 'Spoofing protection has gaps that need attention.'
			: tally.warn > 0
				? 'The basics are in place but can be hardened.'
				: 'Email authentication is well configured.';

	const stats: { label: string; value: number; className: string }[] = [
		{ label: 'Pass', value: tally.pass, className: 'text-emerald-700 dark:text-emerald-400' },
		{ label: 'Warning', value: tally.warn, className: 'text-amber-700 dark:text-amber-400' },
		{ label: 'Fail', value: tally.fail, className: 'text-red-700 dark:text-red-400' },
		{ label: 'Not set', value: tally.none, className: 'text-muted-foreground' },
	];

	return (
		<div className="border-border/60 bg-card/40 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="text-muted-foreground text-xs tracking-wider uppercase">
					Email authentication
				</p>
				<p className="text-foreground mt-1 text-sm font-medium">{verdict}</p>
			</div>
			<ul className="flex shrink-0 gap-5">
				{stats.map(stat => (
					<li key={stat.label} className="flex flex-col items-end">
						<span className={cn('text-2xl font-semibold tabular-nums', stat.className)}>
							{stat.value}
						</span>
						<span className="text-muted-foreground text-xs">{stat.label}</span>
					</li>
				))}
			</ul>
		</div>
	);
};

const CheckCard: FC<{ check: EmailCheck }> = ({ check }) => {
	const meta = STATUS_META[check.status];
	return (
		<section className="border-border/60 bg-card/40 overflow-hidden rounded-2xl border">
			<header className="border-border/60 flex items-start justify-between gap-4 border-b px-5 py-4">
				<div className="min-w-0">
					<div className="flex items-center gap-2.5">
						<h3 className="text-foreground text-base font-semibold">{check.title}</h3>
						<span
							className={cn(
								'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
								meta.badge,
							)}
						>
							{meta.icon}
							{meta.label}
						</span>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">{check.tagline}</p>
				</div>
			</header>

			<div className="space-y-4 px-5 py-4">
				<p className="text-foreground text-sm">{check.summary}</p>

				{check.details.length > 0 ? (
					<dl className="flex flex-wrap gap-2">
						{check.details.map(detail => (
							<div
								key={detail.label}
								className="bg-muted/50 flex items-baseline gap-1.5 rounded-lg px-2.5 py-1"
							>
								<dt className="text-muted-foreground text-xs">{detail.label}</dt>
								<dd className="text-foreground max-w-[16rem] truncate font-mono text-xs">
									{detail.value}
								</dd>
							</div>
						))}
					</dl>
				) : null}

				{check.findings.length > 0 ? (
					<ul className="space-y-2">
						{check.findings.map((finding, index) => (
							<li key={index} className="flex items-start gap-2.5 text-sm">
								<span
									aria-hidden
									className={cn(
										'mt-1.5 size-1.5 shrink-0 rounded-full',
										FINDING_DOT[finding.level],
									)}
								/>
								<span className="text-muted-foreground leading-relaxed">{finding.message}</span>
							</li>
						))}
					</ul>
				) : null}

				{check.record ? (
					<div className="bg-muted/40 flex items-start justify-between gap-2 rounded-lg px-3 py-2">
						<code className="text-muted-foreground min-w-0 font-mono text-xs leading-relaxed break-all">
							{check.record}
						</code>
						<CopyButton value={check.record} label="Copy record" />
					</div>
				) : null}
			</div>
		</section>
	);
};

const EmailSecurityReportView: FC<{ report: EmailSecurityReport }> = ({ report }) => (
	<div className="space-y-5">
		<Summary report={report} />
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{report.checks.map(check => (
				<CheckCard key={check.id} check={check} />
			))}
		</div>
		<p className="text-muted-foreground text-xs">
			Checks query live DNS over Cloudflare and the public MTA-STS policy endpoint. DKIM selectors
			cannot be listed from DNS, so DKIM detection probes common provider selectors only.
		</p>
	</div>
);

export default EmailSecurityReportView;
