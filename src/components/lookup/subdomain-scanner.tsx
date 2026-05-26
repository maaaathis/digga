'use client';

import { Layers, Loader2, Play, ShieldCheck } from 'lucide-react';
import { type FC, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { type SubdomainScanResult, scanSubdomains } from '@/app/lookup/[domain]/subdomains/actions';
import SubdomainResults from '@/components/lookup/subdomain-results';
import TurnstileWidget from '@/components/turnstile-widget';
import { Button } from '@/components/ui/button';

type SubdomainScannerProps = {
	domain: string;
};

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const SubdomainScanner: FC<SubdomainScannerProps> = ({ domain }) => {
	const [result, setResult] = useState<SubdomainScanResult | null>(null);
	const [pending, startTransition] = useTransition();
	const [captchaToken, setCaptchaToken] = useState<string | null>(null);
	const [captchaReset, setCaptchaReset] = useState(0);

	const captchaRequired = Boolean(TURNSTILE_SITE_KEY);

	const onScan = () => {
		if (captchaRequired && !captchaToken) {
			toast.error('Please complete the verification first.');
			return;
		}

		const tokenForScan = captchaToken;
		setResult(null);
		startTransition(async () => {
			const next = await scanSubdomains(domain, tokenForScan);
			setResult(next);
			if (captchaRequired) {
				setCaptchaToken(null);
				setCaptchaReset(value => value + 1);
			}
			if (next.kind === 'ok') {
				toast.success(`Found ${next.subdomains.length} subdomains`);
			} else if (next.kind === 'rate-limited') {
				toast.error('Slow down a bit. Try again in a minute.');
			} else if (next.kind === 'busy') {
				toast.error('Scanner is at capacity. Try again in a moment.');
			} else if (next.kind === 'captcha-failed') {
				toast.error('Verification failed. Please try again.');
			} else if (next.kind === 'unavailable') {
				toast.error('Subdomain discovery is unavailable right now.');
			}
		});
	};

	const hasResults = result?.kind === 'ok' && result.subdomains.length > 0;
	const errorMessage = result ? errorTextFor(result) : null;

	if (hasResults && result?.kind === 'ok') {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-3">
					<p className="text-muted-foreground text-sm">
						Subdomains for <span className="text-foreground font-mono">{domain}</span>
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={onScan}
						disabled={pending}
						className="gap-1.5 rounded-lg"
					>
						{pending ? (
							<Loader2 className="size-3.5 animate-spin" />
						) : (
							<Play className="size-3.5" />
						)}
						Rescan
					</Button>
				</div>
				<SubdomainResults domain={domain} subdomains={result.subdomains} tookMs={result.tookMs} />
				{captchaRequired && TURNSTILE_SITE_KEY ? (
					<div className="hidden">
						<TurnstileWidget
							siteKey={TURNSTILE_SITE_KEY}
							onVerify={setCaptchaToken}
							onExpire={() => setCaptchaToken(null)}
							resetSignal={captchaReset}
						/>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div className="border-border/60 bg-card/40 mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed px-6 py-14 text-center">
			<span className="bg-muted text-foreground mb-5 inline-flex size-14 items-center justify-center rounded-2xl">
				{pending ? <Loader2 className="size-6 animate-spin" /> : <Layers className="size-6" />}
			</span>

			<h2 className="text-foreground text-xl font-semibold tracking-tight">
				{pending ? 'Scanning sources' : 'Discover subdomains'}
			</h2>
			<p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
				{pending
					? 'Querying passive sources like Certificate Transparency and friends. This usually takes a few seconds.'
					: 'Passive enumeration from public sources. No active probes hit the target, results come from public records only.'}
			</p>

			<div className="mt-7 flex flex-col items-center gap-3">
				<Button onClick={onScan} disabled={pending} size="lg" className="gap-2 rounded-xl">
					{pending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
					{pending ? 'Scanning' : 'Run scan'}
				</Button>

				{captchaRequired && TURNSTILE_SITE_KEY ? (
					<div className="flex flex-col items-center gap-2">
						<TurnstileWidget
							siteKey={TURNSTILE_SITE_KEY}
							onVerify={setCaptchaToken}
							onExpire={() => setCaptchaToken(null)}
							resetSignal={captchaReset}
						/>
						<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<ShieldCheck className="size-3.5" />A quick human check keeps the scanner free for
							everyone.
						</p>
					</div>
				) : null}
			</div>

			{errorMessage ? (
				<p className="text-destructive mt-6 max-w-sm text-sm">{errorMessage}</p>
			) : null}
		</div>
	);
};

function errorTextFor(result: SubdomainScanResult): string | null {
	switch (result.kind) {
		case 'unavailable':
			return 'Subdomain discovery is unavailable right now. Please try again later.';
		case 'rate-limited':
			return `You hit the per IP rate limit. Try again in ${Math.ceil(
				result.retryAfterMs / 1000,
			)}s.`;
		case 'busy':
			return 'The scanner is at capacity right now. Give it a few seconds and try again.';
		case 'captcha-failed':
			return 'Human verification failed or expired. Please try the scan again.';
		case 'forbidden':
			return 'This endpoint is not available for automated traffic.';
		case 'timeout':
			return 'The scan timed out. Try again or pick a smaller scope.';
		case 'error':
			return result.message;
		default:
			return null;
	}
}

export default SubdomainScanner;
