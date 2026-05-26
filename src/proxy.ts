import { type NextRequest, NextResponse } from 'next/server';

import { inspectUserAgent } from '@/lib/bot';

export const proxy = (request: NextRequest): NextResponse | Response => {
	if (process.env.ALLOWED_BOTS) {
		const userAgent = request.headers.get('user-agent');
		const inspection = inspectUserAgent(userAgent);
		if (inspection.isBot && !inspection.isAllowed) {
			return new Response('Forbidden', { status: 403 });
		}
	}
	return NextResponse.next();
};

export const config = {
	matcher: [
		{
			source: '/lookup/:path*',
			missing: [
				{ type: 'header', key: 'next-router-prefetch' },
				{ type: 'header', key: 'purpose', value: 'prefetch' },
			],
		},
	],
};
