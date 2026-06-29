import { siteUrl } from '@/lib/seo';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export const INDEXNOW_KEY_PATH = '/indexnow-key.txt';

const MAX_URLS_PER_REQUEST = 10_000;

export function getIndexNowKey(): string | null {
	return process.env.INDEXNOW_KEY?.trim() || null;
}

export type IndexNowResult =
	| { ok: true; submitted: number; status: number }
	| { ok: false; skipped: 'no-key' | 'no-public-host' | 'no-urls' }
	| { ok: false; status: number };

export async function submitToIndexNow(urls: readonly string[]): Promise<IndexNowResult> {
	const key = getIndexNowKey();
	if (!key) return { ok: false, skipped: 'no-key' };

	const base = siteUrl();
	if (!base || base.startsWith('http://localhost')) {
		return { ok: false, skipped: 'no-public-host' };
	}

	const host = new URL(base).host;
	const urlList = [
		...new Set(
			urls
				.map(url =>
					url.startsWith('http') ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`,
				)
				.filter(url => {
					try {
						return new URL(url).host === host;
					} catch {
						return false;
					}
				}),
		),
	].slice(0, MAX_URLS_PER_REQUEST);

	if (urlList.length === 0) return { ok: false, skipped: 'no-urls' };

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

	if (!response.ok) return { ok: false, status: response.status };
	return { ok: true, submitted: urlList.length, status: response.status };
}
