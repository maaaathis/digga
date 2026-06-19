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
	{ name: 'HostGator', domain: 'hostgator.com', match: ['hostgator.com'] },
	{
		name: 'Openprovider',
		domain: 'openprovider.com',
		match: ['openprovider.nl', 'openprovider.be', 'openprovider.eu'],
	},
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
		match: [
			'hetzner.com',
			'hetzner.de',
			'your-server.de',
			'first-ns.de',
			'second-ns.de',
			'second-ns.com',
		],
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
	{ name: 'Akamai', domain: 'akamai.com', match: ['akam.net'] },
	{
		name: 'UltraDNS',
		domain: 'vercara.com',
		match: ['ultradns.net', 'ultradns.com', 'ultradns.org', 'ultradns.biz', 'ultradns.info'],
	},
	{ name: 'Oracle Dyn', domain: 'oracle.com', match: ['dynect.net'] },
	{ name: 'Hurricane Electric', domain: 'he.net', match: ['he.net'] },
	{ name: 'Name.com', domain: 'name.com', match: ['name.com'] },
	{ name: 'Network Solutions', domain: 'networksolutions.com', match: ['worldnic.com'] },
	{ name: 'eNom', domain: 'enom.com', match: ['name-services.com'] },
	{ name: 'Wix', domain: 'wix.com', match: ['wixdns.net'] },
	{ name: 'Squarespace', domain: 'squarespace.com', match: ['squarespacedns.com'] },
	{ name: 'Hostinger', domain: 'hostinger.com', match: ['dns-parking.com'] },
	{ name: 'Bluehost', domain: 'bluehost.com', match: ['bluehost.com'] },
	{ name: 'Dynadot', domain: 'dynadot.com', match: ['dynadot.com'] },
	{ name: 'Hover', domain: 'hover.com', match: ['hover.com'] },
	{ name: 'Linode', domain: 'linode.com', match: ['linode.com'] },
	{ name: 'WordPress.com', domain: 'wordpress.com', match: ['wordpress.com'] },
	{ name: 'DanDomain', domain: 'dandomain.dk', match: ['dandomain.dk'] },
	{ name: 'EuroDNS', domain: 'eurodns.com', match: ['eurodns.com'] },
	{ name: 'STRATO', domain: 'strato.de', match: ['rzone.de', 'stratoserver.net'] },
	{ name: 'DENIC', domain: 'denic.de', match: ['nsentry.de'] },
	{ name: 'Bunny', domain: 'bunny.net', match: ['bunny.net'] },
	{ name: 'mittwald', domain: 'mittwald.de', match: ['agenturserver.de'] },
	{ name: 'T-Online', domain: 't-online.de', match: ['t-online.de'] },
	{ name: 'netcup', domain: 'netcup.com', match: ['netcup.net'] },
	{ name: 'ALL-INKL', domain: 'all-inkl.com', match: ['kasserver.com'] },
	{ name: 'Alfahosting', domain: 'alfahosting.de', match: ['alfahosting.info'] },
	{ name: 'InternetX', domain: 'internetx.com', match: ['ns14.net', 'ns15.net'] },
	{ name: 'Infomaniak', domain: 'infomaniak.com', match: ['infomaniak.ch', 'infomaniak.com'] },
	{
		name: 'United Domains',
		domain: 'united-domains.de',
		match: ['udag.de', 'udag.net', 'udag.org'],
	},
	{ name: 'goneo', domain: 'goneo.de', match: ['goneo.de'] },
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
