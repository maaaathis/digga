import 'server-only';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function isTurnstileEnabled(): boolean {
	return Boolean(process.env.TURNSTILE_SECRET);
}

export type TurnstileVerification = { ok: true; skipped: boolean } | { ok: false };

export async function verifyTurnstile(
	token: string | null | undefined,
	remoteIp?: string | null,
): Promise<TurnstileVerification> {
	const secret = process.env.TURNSTILE_SECRET;

	// Not configured: treat as a pass so local dev and self-hosters without
	// Turnstile keys keep working.
	if (!secret) return { ok: true, skipped: true };

	if (!token) return { ok: false };

	const body = new URLSearchParams();
	body.set('secret', secret);
	body.set('response', token);
	if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

	try {
		const response = await fetch(SITEVERIFY_URL, {
			method: 'POST',
			body,
		});
		if (!response.ok) return { ok: false };
		const data = (await response.json()) as { success?: boolean };
		return data.success === true ? { ok: true, skipped: false } : { ok: false };
	} catch (error) {
		console.error('Turnstile verify failed:', error);
		return { ok: false };
	}
}
