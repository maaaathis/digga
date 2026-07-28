const MAX_DOMAIN_LENGTH = 253;
const MAX_LABEL_LENGTH = 63;
const MAX_LABELS = 12;
const LABEL_PATTERN = /^(?=.*[a-z0-9])[a-z0-9_-]+$/i;
const TLD_PATTERN = /^(?:xn--)?(?!\d+$)[a-z0-9]+$/i;

export function normalizeDomain(input: string): string {
	return stripTrailingDot(input.trim().toLowerCase());
}

export function stripTrailingDot(input: string): string {
	return input.endsWith('.') ? input.slice(0, -1) : input;
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
	return TLD_PATTERN.test(labels[labels.length - 1]);
}
