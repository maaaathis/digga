export type HostingProvider = {
	name: string;
	domain: string;
};

type ProviderRule = HostingProvider & {
	match: string[];
};

const PROVIDERS: ProviderRule[] = [
	{ name: 'Amazon Web Services', domain: 'aws.amazon.com', match: ['amazon', 'aws'] },
	{ name: 'Google Cloud', domain: 'cloud.google.com', match: ['google'] },
	{ name: 'Microsoft Azure', domain: 'azure.microsoft.com', match: ['microsoft', 'azure'] },
	{ name: 'Cloudflare', domain: 'cloudflare.com', match: ['cloudflare'] },
	{ name: 'Hetzner', domain: 'hetzner.com', match: ['hetzner'] },
	{ name: 'OVHcloud', domain: 'ovhcloud.com', match: ['ovh'] },
	{ name: 'DigitalOcean', domain: 'digitalocean.com', match: ['digitalocean'] },
	{ name: 'IONOS', domain: 'ionos.com', match: ['ionos', '1&1', '1und1'] },
	{ name: 'netcup', domain: 'netcup.net', match: ['netcup'] },
	{ name: 'mittwald', domain: 'mittwald.de', match: ['mittwald'] },
	{ name: 'Vercel', domain: 'vercel.com', match: ['vercel'] },
	{ name: 'Akamai', domain: 'akamai.com', match: ['akamai', 'linode'] },
	{ name: 'Fastly', domain: 'fastly.com', match: ['fastly'] },
	{ name: 'Oracle Cloud', domain: 'oracle.com', match: ['oracle'] },
	{ name: 'Strato', domain: 'strato.de', match: ['strato'] },
	{ name: 'GoDaddy', domain: 'godaddy.com', match: ['godaddy'] },
	{ name: 'Hostinger', domain: 'hostinger.com', match: ['hostinger'] },
];

export function detectHostingProvider(org: string | null | undefined): HostingProvider | null {
	if (!org) return null;
	const normalized = org.toLowerCase();

	for (const provider of PROVIDERS) {
		if (provider.match.some(needle => normalized.includes(needle))) {
			return { name: provider.name, domain: provider.domain };
		}
	}

	return null;
}
