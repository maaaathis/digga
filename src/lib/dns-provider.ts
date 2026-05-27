export type DnsProvider = {
	name: string;
	domain: string;
};

type ProviderRule = DnsProvider & {
	match?: string[];
	contains?: string[];
};

const PROVIDERS: ProviderRule[] = [
	{ name: 'Cloudflare', domain: 'cloudflare.com', match: ['cloudflare.com', 'ns.cloudflare.com'] },
	{ name: 'AWS Route 53', domain: 'aws.amazon.com', contains: ['awsdns'] },
	{ name: 'Google Cloud DNS', domain: 'cloud.google.com', match: ['googledomains.com'] },
	{
		name: 'Azure DNS',
		domain: 'azure.microsoft.com',
		match: ['azure-dns.com', 'azure-dns.net', 'azure-dns.org', 'azure-dns.info'],
	},
	{ name: 'DigitalOcean', domain: 'digitalocean.com', match: ['digitalocean.com'] },
	{ name: 'Vercel', domain: 'vercel.com', match: ['vercel-dns.com'] },
	{ name: 'GoDaddy', domain: 'godaddy.com', match: ['domaincontrol.com'] },
	{
		name: 'Namecheap',
		domain: 'namecheap.com',
		match: ['registrar-servers.com', 'namecheaphosting.com'],
	},
	{
		name: 'IONOS',
		domain: 'ionos.com',
		match: ['ui-dns.com', 'ui-dns.de', 'ui-dns.org', 'ui-dns.biz'],
	},
	{ name: 'OVHcloud', domain: 'ovhcloud.com', match: ['ovh.net', 'anycast.me'] },
	{
		name: 'Hetzner',
		domain: 'hetzner.com',
		match: ['hetzner.com', 'hetzner.de', 'your-server.de'],
	},
	{ name: 'Gandi', domain: 'gandi.net', match: ['gandi.net'] },
	{ name: 'Porkbun', domain: 'porkbun.com', match: ['porkbun.com'] },
	{ name: 'deSEC', domain: 'desec.io', match: ['desec.io', 'desec.org'] },
	{ name: 'ClouDNS', domain: 'cloudns.net', match: ['cloudns.net'] },
	{ name: 'DNS Made Easy', domain: 'dnsmadeeasy.com', match: ['dnsmadeeasy.com'] },
	{
		name: 'DNSimple',
		domain: 'dnsimple.com',
		match: [
			'dnsimple.com',
			'dnsimple-edge.com',
			'dnsimple-edge.net',
			'dnsimple-edge.io',
			'dnsimple-edge.org',
		],
	},
	{ name: 'IBM NS1 Connect', domain: 'ns1.com', match: ['nsone.net'] },
	{ name: 'Bunny', domain: 'bunny.net', match: ['bunny.net'] },
	{ name: 'mittwald', domain: 'mittwald.de', match: ['agenturserver.de'] },
	{ name: 'T-Online', domain: 't-online.de', match: ['t-online.de'] },
	{ name: 'netcup', domain: 'netcup.net', match: ['netcup.net'] },
	{ name: 'ALL-INKL', domain: 'all-inkl.com', match: ['kasserver.com'] },
];

function nsHost(host: string): string {
	return host.trim().replace(/\.$/, '').toLowerCase();
}

export function detectDnsProvider(nameservers: string[]): DnsProvider | null {
	const hosts = nameservers.map(nsHost).filter(Boolean);
	if (hosts.length === 0) return null;

	for (const provider of PROVIDERS) {
		const isMatch = hosts.some(
			host =>
				(provider.match?.some(suffix => host === suffix || host.endsWith(`.${suffix}`)) ?? false) ||
				(provider.contains?.some(part => host.includes(part)) ?? false),
		);
		if (isMatch) return { name: provider.name, domain: provider.domain };
	}

	return null;
}
