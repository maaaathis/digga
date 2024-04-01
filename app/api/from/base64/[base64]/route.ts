import { NextResponse } from 'next/server';

import { cleanDomain } from '@/lib/domain';

export async function GET(
  request: Request,
  context: { params: { base64: string } }
) {
  const base64 = context.params.base64;

  if (!base64) {
    return NextResponse.json(
      { error: true, message: 'base64 param missing' },
      { status: 400 }
    );
  }

  const decoded = atob(base64);

  const cleanedDomain = cleanDomain(decoded);

  const lookupPageUrl = new URL('/lookup/' + cleanedDomain, request.url);

  return NextResponse.redirect(lookupPageUrl, { status: 301 });
}
