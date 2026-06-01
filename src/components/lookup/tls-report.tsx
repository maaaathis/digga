import {
	BadgeCheck,
	CalendarClock,
	Fingerprint,
	Link2,
	Lock,
	ShieldAlert,
	ShieldCheck,
} from 'lucide-react';
import type { FC, ReactNode } from 'react';

import CopyButton from '@/components/copy-button';
import StateNotice from '@/components/lookup/state-notice';
import Widget from '@/components/lookup/widget';
import { Badge } from '@/components/ui/badge';
import type { TlsCertificate, TlsErrorReason, TlsResult } from '@/lib/tls';
import { cn } from '@/lib/utils';

type TlsReportProps = {
	domain: string;
	result: TlsResult;
};

const EXPIRY_WARN_DAYS = 21;

function formatDate(input: string): string {
	const date = new Date(input);
	if (Number.isNaN(date.getTime())) return input;
	return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

const ERROR_COPY: Record<TlsErrorReason, { title: string; description: string }> = {
	'timeout': {
		title: 'No response on port 443',
		description:
			'The host did not complete a TLS handshake in time. It may be down or blocking us.',
	},
	'refused': {
		title: 'Connection refused',
		description: 'Nothing accepted an HTTPS connection on port 443 for this host.',
	},
	'dns': {
		title: 'Host did not resolve',
		description:
			'We could not resolve this domain to an address, so there was nothing to connect to.',
	},
	'no-tls': {
		title: 'No TLS on port 443',
		description: 'The host answered but did not present a TLS certificate.',
	},
	'unknown': {
		title: 'Could not read the certificate',
		description: 'The TLS handshake failed for an unexpected reason.',
	},
};

type Verdict = {
	tone: 'positive' | 'warning' | 'error';
	label: string;
	headline: string;
	icon: typeof ShieldCheck;
};

function verdictFor(cert: TlsCertificate): Verdict {
	if (cert.expired) {
		return {
			tone: 'error',
			label: 'Expired',
			headline: `This certificate expired ${Math.abs(cert.daysRemaining)} days ago.`,
			icon: ShieldAlert,
		};
	}
	if (cert.notYetValid) {
		return {
			tone: 'error',
			label: 'Not yet valid',
			headline: 'This certificate is not valid yet.',
			icon: ShieldAlert,
		};
	}
	if (!cert.valid) {
		return {
			tone: 'warning',
			label: 'Untrusted',
			headline: 'The certificate is in date but the chain did not verify.',
			icon: ShieldAlert,
		};
	}
	if (cert.daysRemaining <= EXPIRY_WARN_DAYS) {
		return {
			tone: 'warning',
			label: 'Expiring soon',
			headline: `Valid, but renews in ${cert.daysRemaining} days.`,
			icon: ShieldAlert,
		};
	}
	return {
		tone: 'positive',
		label: 'Valid',
		headline: 'The certificate is trusted and in date.',
		icon: ShieldCheck,
	};
}

const TONE_BADGE: Record<Verdict['tone'], string> = {
	positive: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
	warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
	error: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

const TONE_TEXT: Record<Verdict['tone'], string> = {
	positive: 'text-emerald-700 dark:text-emerald-400',
	warning: 'text-amber-700 dark:text-amber-400',
	error: 'text-red-700 dark:text-red-400',
};

const Field: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
	<div className="bg-muted/40 rounded-lg p-3">
		<dt className="text-muted-foreground text-xs">{label}</dt>
		<dd className="text-foreground mt-1 text-sm">{children}</dd>
	</div>
);

const TlsReport: FC<TlsReportProps> = ({ domain, result }) => {
	if (result.kind === 'error') {
		const copy = ERROR_COPY[result.reason];
		return (
			<StateNotice
				tone="warning"
				icon={<ShieldAlert className="size-9" />}
				title={copy.title}
				description={copy.description}
				footnote={`${domain} · port 443`}
			/>
		);
	}

	const cert = result.certificate;
	const verdict = verdictFor(cert);
	const VerdictIcon = verdict.icon;
	const issuer =
		cert.issuerCommonName && cert.issuerOrg
			? `${cert.issuerCommonName} (${cert.issuerOrg})`
			: (cert.issuerCommonName ?? cert.issuerOrg ?? 'Unknown');

	return (
		<div className="space-y-10">
			<div className="border-border/60 bg-card/40 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<span
						className={cn(
							'inline-flex size-9 items-center justify-center rounded-xl',
							TONE_BADGE[verdict.tone],
						)}
					>
						<VerdictIcon className="size-5" />
					</span>
					<div>
						<p className="text-muted-foreground text-xs tracking-wider uppercase">
							TLS certificate
						</p>
						<p className="text-foreground mt-1 text-sm font-medium">{verdict.headline}</p>
					</div>
				</div>
				<div className="flex flex-col items-start gap-1 sm:items-end">
					<Badge className={cn('font-medium', TONE_BADGE[verdict.tone])}>{verdict.label}</Badge>
					{!cert.expired && !cert.notYetValid ? (
						<span className={cn('text-xs tabular-nums', TONE_TEXT[verdict.tone])}>
							{cert.daysRemaining} days left
						</span>
					) : null}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
				<Widget variant="section" title="Certificate" icon={<BadgeCheck className="size-3.5" />}>
					<dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Field label="Issuer">{issuer}</Field>
						<Field label="Subject">{cert.subjectCommonName ?? '—'}</Field>
					</dl>
				</Widget>

				<Widget variant="section" title="Validity" icon={<CalendarClock className="size-3.5" />}>
					<dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Field label="Valid from">
							<span className="font-mono">{formatDate(cert.validFrom)}</span>
						</Field>
						<Field label="Valid to">
							<span className="font-mono">{formatDate(cert.validTo)}</span>
						</Field>
					</dl>
				</Widget>

				<Widget variant="section" title="Connection" icon={<Lock className="size-3.5" />}>
					<dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Field label="Protocol">
							<span className="font-mono">{cert.protocol ?? '—'}</span>
						</Field>
						<Field label="Key">
							<span className="font-mono">{cert.keyType ?? '—'}</span>
						</Field>
						{cert.cipher ? (
							<div className="sm:col-span-2">
								<Field label="Cipher">
									<span className="font-mono text-xs">{cert.cipher}</span>
								</Field>
							</div>
						) : null}
					</dl>
				</Widget>

				<Widget
					variant="section"
					title={`Subject alternative names (${cert.subjectAltNames.length})`}
					icon={<Link2 className="size-3.5" />}
				>
					{cert.subjectAltNames.length > 0 ? (
						<ul className="space-y-1.5">
							{cert.subjectAltNames.map(name => (
								<li
									key={name}
									className="bg-muted/40 hover:bg-muted/60 flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-mono text-xs transition-colors"
								>
									<span className="truncate">{name}</span>
									<CopyButton value={name} />
								</li>
							))}
						</ul>
					) : (
						<p className="text-muted-foreground text-sm">No subject alternative names.</p>
					)}
				</Widget>
			</div>

			{cert.chain.length > 0 ? (
				<Widget variant="section" title="Chain" icon={<ShieldCheck className="size-3.5" />}>
					<ol className="space-y-2">
						{cert.chain.map((entry, index) => (
							<li
								key={`${entry.subject}-${index}`}
								className="bg-muted/40 flex items-center gap-3 rounded-lg px-3 py-2.5"
							>
								<span className="text-muted-foreground font-mono text-[10px] tabular-nums">
									{String(index + 1).padStart(2, '0')}
								</span>
								<div className="min-w-0">
									<p className="text-foreground truncate text-sm">{entry.subject ?? 'Unknown'}</p>
									{entry.issuer && entry.issuer !== entry.subject ? (
										<p className="text-muted-foreground truncate text-xs">
											issued by {entry.issuer}
										</p>
									) : (
										<p className="text-muted-foreground text-xs">root</p>
									)}
								</div>
							</li>
						))}
					</ol>
				</Widget>
			) : null}

			{cert.fingerprint256 || cert.serialNumber ? (
				<Widget variant="section" title="Fingerprint" icon={<Fingerprint className="size-3.5" />}>
					<dl className="space-y-3 text-sm">
						{cert.fingerprint256 ? (
							<div>
								<dt className="text-muted-foreground text-xs">SHA-256</dt>
								<dd className="text-foreground mt-0.5 flex items-center gap-1 font-mono text-xs">
									<span className="truncate">{cert.fingerprint256}</span>
									<CopyButton value={cert.fingerprint256} />
								</dd>
							</div>
						) : null}
						{cert.serialNumber ? (
							<div>
								<dt className="text-muted-foreground text-xs">Serial number</dt>
								<dd className="text-foreground mt-0.5 flex items-center gap-1 font-mono text-xs">
									<span className="truncate">{cert.serialNumber}</span>
									<CopyButton value={cert.serialNumber} />
								</dd>
							</div>
						) : null}
					</dl>
				</Widget>
			) : null}
		</div>
	);
};

export default TlsReport;
