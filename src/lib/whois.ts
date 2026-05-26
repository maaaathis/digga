import 'server-only';

import { whoisDomain } from 'whoiser';

type DomainWhoisData = {
	'Domain Name'?: string;
	'Domain Status'?: string[];
	'Name Server'?: string[];
	'text'?: string[];
	'__raw'?: string;
	[key: string]: string | string[] | undefined;
};
type DomainWhois = Record<string, DomainWhoisData>;

import { getBaseDomain, getTLD, isValidLookupDomain } from '@/lib/domain';

export enum DomainAvailability {
	UNKNOWN = 'unknown',
	RESERVED = 'reserved',
	REGISTERED = 'registered',
	AVAILABLE = 'available',
}

const SOFT_ERROR_PATTERNS = [
	'transformAlgorithm',
	'kState',
	'stream',
	'Transform',
	'timeout',
	'ECONNREFUSED',
	'ETIMEDOUT',
];

function isSoftError(message: string): boolean {
	return SOFT_ERROR_PATTERNS.some(pattern => message.includes(pattern));
}

function isUnsupportedTld(message: string): boolean {
	return message.includes('TLD for') && message.includes('not supported');
}

export type WhoisRawByServer = Record<string, string>;

export async function lookupWhoisRaw(domain: string): Promise<WhoisRawByServer | null> {
	const base = getBaseDomain(domain);
	if (!base || !isValidLookupDomain(base)) return null;

	try {
		const result = await whoisDomain(base, { raw: true, timeout: 5_000 });
		const mapped: WhoisRawByServer = {};
		for (const key of Object.keys(result)) {
			const block = result[key];
			if (block && typeof block === 'object') {
				const raw = (block as DomainWhoisData & { __raw?: string }).__raw;
				if (typeof raw === 'string') mapped[key] = raw;
			}
		}
		return mapped;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		if (isUnsupportedTld(message) || isSoftError(message)) return null;
		console.error('WHOIS raw lookup error:', error);
		return null;
	}
}

export async function lookupWhoisParsed(domain: string): Promise<DomainWhois | null> {
	const base = getBaseDomain(domain);
	if (!base || !isValidLookupDomain(base)) return null;

	try {
		return await whoisDomain(base, { timeout: 5_000 });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		if (isUnsupportedTld(message) || isSoftError(message)) return null;
		console.error('WHOIS parsed lookup error:', error);
		return null;
	}
}

function firstResult(obj: DomainWhois | null): DomainWhoisData | null {
	if (!obj || typeof obj !== 'object') return null;
	const keys = Object.keys(obj);
	if (keys.length === 0) return null;
	const block = obj[keys[0]];
	return block && typeof block === 'object' ? block : null;
}

export async function isDomainAvailable(input: string): Promise<boolean> {
	const base = getBaseDomain(input);
	if (!base || !isValidLookupDomain(base)) return false;

	const tld = getTLD(base);
	if (!tld) return false;
	if (tld === 'ch' || tld === 'li') return false;

	let result: DomainWhois | null;
	try {
		result = await whoisDomain(base, { follow: 1, timeout: 5_000 });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (isUnsupportedTld(message) || isSoftError(message)) return false;
		console.error('Availability check error:', error);
		return false;
	}

	const first = firstResult(result);
	if (!first) return false;

	const textArr = first.text as string[] | undefined;
	const text = textArr?.[0]?.toLowerCase() ?? '';
	if (text.includes(`no match for "${base}"`)) return true;

	const domainName = (first['Domain Name'] as string | undefined)?.toLowerCase();
	const statusArr = first['Domain Status'] as string[] | undefined;

	if (statusArr) {
		const flat = statusArr.join(' ').toLowerCase();
		if (flat.includes('available') || flat.includes('free') || flat.includes('no object found'))
			return true;
	}

	if (domainName === base && statusArr && statusArr.length > 0) return false;
	if (text.includes('reserved')) return false;

	return false;
}
