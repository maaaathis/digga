import 'server-only';

import { unstable_cache } from 'next/cache';
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
import { lookupRdap } from '@/lib/rdap/client';

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
	return (
		(message.includes('TLD for') && message.includes('not supported')) ||
		/^TLD ".+" not found$/.test(message) ||
		/^Invalid TLD ".+"$/.test(message)
	);
}

export type WhoisRawByServer = Record<string, string>;

const CACHE_TTL_SECONDS = 3_600;

function cacheNullable<A extends unknown[], R>(
	fn: (...args: A) => Promise<R | null>,
	keyParts: string[],
): (...args: A) => Promise<R | null> {
	const cached = unstable_cache(
		async (...args: A) => {
			const result = await fn(...args);
			if (result === null) throw new Error('whois-skip-cache');
			return result;
		},
		keyParts,
		{ revalidate: CACHE_TTL_SECONDS },
	);
	return async (...args: A) => {
		try {
			return await cached(...args);
		} catch {
			return null;
		}
	};
}

export const lookupWhoisRaw = cacheNullable(lookupWhoisRawImpl, ['whois-raw']);
export const lookupWhoisParsed = cacheNullable(lookupWhoisParsedImpl, ['whois-parsed']);

async function lookupWhoisRawImpl(domain: string): Promise<WhoisRawByServer | null> {
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

async function lookupWhoisParsedImpl(domain: string): Promise<DomainWhois | null> {
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

export const getDomainAvailability = unstable_cache(
	getDomainAvailabilityImpl,
	['domain-availability'],
	{ revalidate: CACHE_TTL_SECONDS },
);

async function getDomainAvailabilityImpl(input: string): Promise<DomainAvailability> {
	const base = getBaseDomain(input);
	if (!base || !isValidLookupDomain(base)) return DomainAvailability.UNKNOWN;

	const tld = getTLD(base);
	if (!tld) return DomainAvailability.UNKNOWN;
	// .ch/.li don't expose availability reliably; treat as registered so the normal report renders.
	if (tld === 'ch' || tld === 'li') return DomainAvailability.REGISTERED;

	const rdap = await lookupRdap(base);
	if (rdap.kind === 'ok') return DomainAvailability.REGISTERED;

	const whois = await classifyWhois(base);

	if (rdap.kind === 'not-found') {
		return whois === 'reserved' ? DomainAvailability.RESERVED : DomainAvailability.AVAILABLE;
	}

	if (whois === 'reserved') return DomainAvailability.RESERVED;
	if (whois === 'available') return DomainAvailability.AVAILABLE;
	return DomainAvailability.REGISTERED;
}

const RESERVED_PATTERNS = [
	'not available for registration',
	'registry reserved',
	'reserved name',
	'reserved domain',
	'name is reserved',
];

const AVAILABLE_PATTERNS = [
	'no match for',
	'domain not found',
	'does not exist',
	'no object found',
	'no entries found',
	'not been registered',
];

type WhoisClassification = 'reserved' | 'available' | 'registered';

async function classifyWhois(base: string): Promise<WhoisClassification> {
	let result: DomainWhois | null;
	try {
		result = await whoisDomain(base, { follow: 1, timeout: 5_000 });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (!isUnsupportedTld(message) && !isSoftError(message)) {
			console.error('Availability check error:', error);
		}
		return 'registered';
	}

	const first = firstResult(result);
	if (!first) return 'registered';

	if (blockSaysReserved(first)) return 'reserved';
	if (blockSaysAvailable(first)) return 'available';
	return 'registered';
}

function blockSaysReserved(block: DomainWhoisData): boolean {
	const textArr = block.text as string[] | undefined;
	const text = (textArr ?? []).join(' ').toLowerCase();
	return RESERVED_PATTERNS.some(pattern => text.includes(pattern));
}

function blockSaysAvailable(block: DomainWhoisData): boolean {
	const textArr = block.text as string[] | undefined;
	const text = (textArr ?? []).join(' ').toLowerCase();
	if (AVAILABLE_PATTERNS.some(pattern => text.includes(pattern))) return true;

	const statusArr = block['Domain Status'] as string[] | undefined;
	if (statusArr) {
		const flat = statusArr.join(' ').toLowerCase();
		if (flat.includes('available') || flat.includes('free') || flat.includes('no object found'))
			return true;
	}

	return false;
}
