'use server';

import { headers } from 'next/headers';

import { inspectUserAgent } from '@/lib/bot';
import { isValidLookupDomain, normalizeDomain } from '@/lib/domain';
import { consumeToken, ipFromHeaders, sweepBuckets } from '@/lib/rate-limit';
import { runSubfinder } from '@/lib/subdomains';
import { verifyTurnstile } from '@/lib/turnstile';

export type SubdomainScanResult =
	| { kind: 'ok'; subdomains: string[]; tookMs: number }
	| { kind: 'forbidden' }
	| { kind: 'captcha-failed' }
	| { kind: 'rate-limited'; retryAfterMs: number }
	| { kind: 'busy' }
	| { kind: 'unavailable' }
	| { kind: 'timeout' }
	| { kind: 'error'; message: string };

export async function scanSubdomains(
	input: string,
	captchaToken?: string | null,
): Promise<SubdomainScanResult> {
	const headerStore = await headers();
	const userAgent = headerStore.get('user-agent');
	const inspection = inspectUserAgent(userAgent);
	if (inspection.isBot && !inspection.isAllowed) {
		return { kind: 'forbidden' };
	}

	sweepBuckets();
	const ip = ipFromHeaders(headerStore);
	const limit = consumeToken(`subdomains:${ip}`, {
		capacity: 5,
		refillPerSecond: 1 / 30,
	});
	if (!limit.allowed) {
		return { kind: 'rate-limited', retryAfterMs: limit.retryAfterMs };
	}

	const verification = await verifyTurnstile(captchaToken, ip);
	if (!verification.ok) {
		return { kind: 'captcha-failed' };
	}

	const normalized = normalizeDomain(input);
	if (!isValidLookupDomain(normalized)) {
		return { kind: 'error', message: 'Invalid domain' };
	}

	const start = Date.now();
	const result = await runSubfinder(normalized);

	if (result.kind === 'unavailable') return { kind: 'unavailable' };
	if (result.kind === 'busy') return { kind: 'busy' };
	if (result.kind === 'timeout') return { kind: 'timeout' };
	if (result.kind === 'error') return { kind: 'error', message: result.message };

	return {
		kind: 'ok',
		subdomains: result.subdomains,
		tookMs: Date.now() - start,
	};
}
