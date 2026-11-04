export type WhoisBlock = Record<string, unknown>;

export type WhoisBlockState = 'usable' | 'failed' | 'empty' | 'rate-limited';

const RATE_LIMIT_PATTERNS = [
	'limit exceeded',
	'limit reached',
	'exceeded the limit',
	'exceeded your limit',
	'quota exceeded',
	'too many requests',
	'too many queries',
	'too many connections',
	'excessive querying',
	'excessive queries',
	'please slow down',
	'try again later',
	'temporarily blocked',
	'temporarily unavailable',
];

const REGISTRATION_FIELDS = [
	'Domain Name',
	'Registrar',
	'Registry Domain ID',
	'Created Date',
	'Creation Date',
	'Registrar Registration Expiration Date',
	'Expiry Date',
];

function nonEmptyStrings(value: unknown): string[] {
	if (typeof value === 'string') return value.trim() ? [value] : [];
	if (Array.isArray(value)) {
		return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
	}
	return [];
}

function hasRegistrationData(block: WhoisBlock): boolean {
	if (nonEmptyStrings(block['Name Server']).length > 0) return true;
	if (nonEmptyStrings(block['Domain Status']).length > 0) return true;
	return REGISTRATION_FIELDS.some(field => nonEmptyStrings(block[field]).length > 0);
}

function blockText(block: WhoisBlock): string {
	return Object.values(block).flatMap(nonEmptyStrings).join('\n').toLowerCase();
}

export function isRateLimitText(text: string): boolean {
	const lower = text.toLowerCase();
	return RATE_LIMIT_PATTERNS.some(pattern => lower.includes(pattern));
}

export function whoisBlockState(block: WhoisBlock): WhoisBlockState {
	// whoiser catches per-server query failures (timeouts, refused connections)
	// and stores the message under `error` instead of throwing.
	if (nonEmptyStrings(block.error).length > 0 && !hasRegistrationData(block)) return 'failed';
	if (hasRegistrationData(block)) return 'usable';

	const text = blockText(block);
	if (!text.trim()) return 'empty';
	if (isRateLimitText(text)) return 'rate-limited';
	return 'usable';
}

export function isUsableWhoisBlock(value: unknown): value is WhoisBlock {
	return (
		Boolean(value) &&
		typeof value === 'object' &&
		!Array.isArray(value) &&
		whoisBlockState(value as WhoisBlock) === 'usable'
	);
}
