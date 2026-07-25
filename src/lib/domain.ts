import { toASCII, toUnicode } from 'punycode';
import { getDomain, getPublicSuffix, parse } from 'tldts';

import { isValidLookupDomain, normalizeDomain, stripTrailingDot } from '@/lib/domain-core';

export { isValidLookupDomain, normalizeDomain, stripTrailingDot };

export function toAsciiDomain(input: string): string {
	return toASCII(stripTrailingDot(input.trim().toLowerCase()));
}

export function toUnicodeDomain(input: string): string {
	return toUnicode(stripTrailingDot(input.trim().toLowerCase()));
}

export function getBaseDomain(input: string): string | null {
	return getDomain(input);
}

export function getTLD(input: string): string | null {
	return getPublicSuffix(input);
}

export function isKnownTld(input: string): boolean {
	return parse(input).isIcann === true;
}

export function isSubdomain(input: string): boolean {
	const parsed = parse(input);
	return Boolean(parsed.subdomain) && parsed.subdomain !== 'www';
}

export function cleanForLookup(input: string): string | null {
	if (!input) return null;

	let candidate = input.trim().toLowerCase();
	candidate = candidate.replace(/^https?:\/\//, '').split('/')[0];
	candidate = candidate.replace(/^www\./, '');
	candidate = stripTrailingDot(candidate);

	if (!candidate) return null;

	try {
		candidate = toASCII(candidate);
	} catch {
		return null;
	}

	return isValidLookupDomain(candidate) ? candidate : null;
}
