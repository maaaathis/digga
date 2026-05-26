type BootstrapData = {
	description?: string;
	publication?: string;
	version?: string;
	services: [string[], string[]][];
};

type Cache<T> = { value: T; fetchedAt: number };

const BOOTSTRAP_URL = 'https://data.iana.org/rdap/dns.json';
const TTL_MS = 24 * 60 * 60 * 1000;

let cache: Cache<BootstrapData> | null = null;
let inflight: Promise<BootstrapData> | null = null;

async function loadBootstrap(): Promise<BootstrapData> {
	if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.value;
	if (inflight) return inflight;

	inflight = (async () => {
		const response = await fetch(BOOTSTRAP_URL, {
			next: { revalidate: 86_400 },
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch RDAP bootstrap: ${response.status} ${response.statusText}`);
		}
		const data = (await response.json()) as BootstrapData;
		cache = { value: data, fetchedAt: Date.now() };
		return data;
	})();

	try {
		return await inflight;
	} finally {
		inflight = null;
	}
}

export async function getRdapServersForTld(tld: string): Promise<string[] | null> {
	const data = await loadBootstrap();
	const normalized = tld.toLowerCase();

	for (const [tlds, servers] of data.services) {
		if (tlds.map(t => t.toLowerCase()).includes(normalized)) {
			return servers.map(s => s.replace(/\/$/, ''));
		}
	}

	return null;
}
