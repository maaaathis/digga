import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_KEY_PATH = '/indexnow-key.txt';
const MAX_URLS_PER_REQUEST = 10_000;

const TOOL_SLUGS = ['dns', 'whois', 'rdap', 'subdomains', 'email', 'tls'];

function sanitizeForLog(value: string): string {
	let result = '';
	for (const char of value) {
		const code = char.codePointAt(0) ?? 0;
		result += code < 0x20 || code === 0x7f ? ' ' : char;
	}
	return result.trim();
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadCommonLookupUrls(base: string): string[] {
	const path = resolve(__dirname, '..', 'src', 'data', 'common-domains.json');
	try {
		const domains = JSON.parse(readFileSync(path, 'utf8')) as string[];
		return [...new Set(domains)].map(domain => `${base}/lookup/${domain}`);
	} catch (error) {
		console.warn('Could not read common-domains.json, skipping common URLs:', error);
		return [];
	}
}

async function main(): Promise<void> {
	const base = (process.env.SITE_URL ?? '').replace(/\/$/, '');
	const key = process.env.INDEXNOW_KEY?.trim();
	const dryRun = process.argv.includes('--dry-run');
	const includeCommon = process.argv.includes('--common');

	if (!base) {
		console.error('SITE_URL is missing.');
		process.exit(1);
	}
	if (!key) {
		console.error('INDEXNOW_KEY is missing.');
		process.exit(1);
	}

	const urlList = [
		...new Set([
			base,
			...TOOL_SLUGS.map(slug => `${base}/${slug}`),
			...(includeCommon ? loadCommonLookupUrls(base) : []),
		]),
	].slice(0, MAX_URLS_PER_REQUEST);

	const host = new URL(base).host;

	if (dryRun) {
		console.log(`[dry-run] Would submit ${urlList.length} URL(s) for ${host}:`);
		for (const url of urlList) console.log(`  ${url}`);
		return;
	}

	if (base.startsWith('http://localhost')) {
		console.error('SITE_URL must be a public https URL to submit to IndexNow.');
		process.exit(1);
	}

	console.log(`Submitting ${urlList.length} URL(s) for ${host} to IndexNow…`);

	const response = await fetch(INDEXNOW_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body: JSON.stringify({
			host,
			key,
			keyLocation: `${base}${INDEXNOW_KEY_PATH}`,
			urlList,
		}),
	});

	if (!response.ok) {
		const body = await response.text();
		console.error(`IndexNow rejected the submission: ${response.status} ${sanitizeForLog(body)}`);
		process.exit(1);
	}

	console.log(`Done. IndexNow accepted ${urlList.length} URL(s) (HTTP ${response.status}).`);
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
