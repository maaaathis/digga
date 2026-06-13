import isValidDomain from 'is-valid-domain';
import { toASCII, toUnicode } from 'punycode';
import { getDomain, getPublicSuffix, parse } from 'tldts';

const MAX_DOMAIN_LENGTH = 253;
const MAX_LABEL_LENGTH = 63;
const MAX_LABELS = 12;
const LABEL_PATTERN = /^[a-z0-9-]+$/i;

export function normalizeDomain(input: string): string {
	return stripTrailingDot(input.trim().toLowerCase());
}

export function stripTrailingDot(input: string): string {
	return input.endsWith('.') ? input.slice(0, -1) : input;
}

export function toAsciiDomain(input: string): string {
	return toASCII(stripTrailingDot(input.trim().toLowerCase()));
}

export function toUnicodeDomain(input: string): string {
	return toUnicode(stripTrailingDot(input.trim().toLowerCase()));
}

export function isValidLookupDomain(input: string): boolean {
	const domain = normalizeDomain(input);
	if (!domain || domain.length > MAX_DOMAIN_LENGTH || domain.includes('..')) return false;

	const labels = domain.split('.');
	if (labels.length < 2 || labels.length > MAX_LABELS) return false;

	const labelsValid = labels.every(
		label =>
			label.length > 0 &&
			label.length <= MAX_LABEL_LENGTH &&
			LABEL_PATTERN.test(label) &&
			!label.startsWith('-') &&
			!label.endsWith('-'),
	);

	if (!labelsValid) return false;
	return isValidDomain(domain, { subdomain: true, wildcard: false });
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
