import { NextResponse } from 'next/server';

import { cleanForLookup } from '@/lib/domain';

export const dynamic = 'force-dynamic';

/**
 * Entry point for the iOS Shortcut and other share integrations. The current
 * page URL is percent-encoded and then base64-encoded by the caller, e.g.
 * `/api/from/base64/<base64(encodeURIComponent(url))>`. We decode it, pull out
 * the hostname and redirect to the matching lookup page.
 */
export async function GET(request: Request, { params }: { params: Promise<{ data?: string[] }> }) {
	const { data } = await params;
	const encoded = (data ?? []).join('/');

	const home = new URL('/', request.url);
	if (!encoded) return NextResponse.redirect(home, 307);

	let decoded: string;
	try {
		const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
		decoded = Buffer.from(normalized, 'base64').toString('utf8');
	} catch {
		return NextResponse.redirect(home, 307);
	}

	let candidate = decoded;
	try {
		candidate = decodeURIComponent(decoded);
	} catch {
		// Not valid percent-encoding — fall back to the raw decoded value.
	}

	const domain = cleanForLookup(candidate);
	if (!domain) return NextResponse.redirect(home, 307);

	return NextResponse.redirect(`https://digga.dev/lookup/${domain}`, 307);
}
