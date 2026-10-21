import { detectDomainTakeover } from '@/lib/domain-takeover';

export type DnsProvider = {
	name: string;
	domain: string;
	logo?: string;
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
	{ name: 'Jimdo', domain: 'jimdo.com', match: ['jimdo.com'] },
	{ name: 'Oracle Dyn', domain: 'oracle.com', match: ['dynect.net'] },
	{ name: 'Hurricane Electric', domain: 'he.net', match: ['he.net'] },
	{ name: 'Name.com', domain: 'name.com', match: ['name.com'] },
	{ name: 'Network Solutions', domain: 'networksolutions.com', match: ['worldnic.com'] },
	{ name: 'eNom', domain: 'enom.com', match: ['name-services.com'] },
	{ name: 'Wix', domain: 'wix.com', match: ['wixdns.net'] },
	{ name: 'Squarespace', domain: 'squarespace.com', match: ['squarespacedns.com'] },
	{ name: 'Hostinger', domain: 'hostinger.com', match: ['dns-parking.com'] },
	{ name: 'Bluehost', domain: 'bluehost.com', match: ['bluehost.com'] },
	{ name: 'Dynadot', domain: 'dynadot.com', match: ['dynadot.com', 'dyna-ns.net'] },
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
	{
		name: 'Aruba',
		domain: 'aruba.it',
		match: ['arubadns.net', 'arubadns.cz', 'arubadns.com', 'technorail.com'],
	},
	{ name: 'InternetX', domain: 'internetx.com', match: ['ns14.net', 'ns15.net'] },
	{
		name: 'INWX',
		domain: 'inwx.com',
		match: ['inwx.de', 'inwx.eu', 'inwx.com', 'inwx.net'],
	},
	{ name: 'Infomaniak', domain: 'infomaniak.com', match: ['infomaniak.ch', 'infomaniak.com'] },
	{
		name: 'United Domains',
		domain: 'united-domains.de',
		match: ['udag.de', 'udag.net', 'udag.org'],
	},
	{ name: 'goneo', domain: 'goneo.de', match: ['goneo.de'] },
	{ name: 'ZAP-Hosting', domain: 'zap-hosting.com', match: ['zap-hosting.com'] },
	{ name: 'MC-HOST24', domain: 'mc-host24.de', match: ['mc-host24.de'] },
	{ name: 'Scaleway', domain: 'scaleway.com', match: ['dom.scw.cloud'] },
	{ name: 'Vultr', domain: 'vultr.com', match: ['vultr.com'] },
	{
		name: 'TransIP',
		domain: 'transip.eu',
		match: ['transip.net', 'transip.nl', 'transip.eu', 'transdns.eu'],
	},
	{ name: 'one.com', domain: 'one.com', match: ['one.com'] },
	{ name: 'Simply.com', domain: 'simply.com', match: ['simply.com'] },
	{ name: 'Loopia', domain: 'loopia.com', match: ['loopia.se'] },
	{
		name: 'Combell',
		domain: 'combell.com',
		match: ['combell.net', 'combell.eu', 'european-server.com'],
	},
	{ name: 'DreamHost', domain: 'dreamhost.com', match: ['dreamhost.com'] },
	{ name: 'SiteGround', domain: 'siteground.com', match: ['siteground.net'] },
	{ name: 'NameSilo', domain: 'namesilo.com', match: ['dnsowl.com'] },
	{ name: 'Gcore', domain: 'gcore.com', match: ['gcorelabs.net', 'gcdn.services'] },
	{
		name: 'Leaseweb',
		domain: 'leaseweb.com',
		match: ['leaseweb.nl', 'leaseweb.net', 'leaseweb.com'],
	},
	{
		name: 'easyDNS',
		domain: 'easydns.com',
		match: ['easydns.com', 'easydns.net', 'easydns.org', 'easydns.info', 'easydns.ca'],
	},
	{
		name: 'Tencent DNSPod',
		domain: 'dnspod.com',
		match: ['dnsv2.com', 'dnsv3.com', 'dnsv4.com', 'dnsv5.com', 'dnspod.net'],
	},
	{ name: 'easyname', domain: 'easyname.com', match: ['easyname.eu', 'easyname.com'] },
	{ name: 'World4You', domain: 'world4you.com', match: ['world4you.at'] },
	{ name: 'Websupport', domain: 'websupport.sk', match: ['websupport.sk'] },
	{ name: 'ACTIVE 24', domain: 'active24.cz', match: ['active24.cz', 'active24.sk'] },
	{
		name: 'FORPSI',
		domain: 'forpsi.com',
		match: ['forpsi.net', 'forpsi.cz', 'forpsi.it', 'forpsi.us'],
	},
	{ name: 'Joker.com', domain: 'joker.com', match: ['ns.joker.com'] },
	{ name: 'Domeneshop', domain: 'domainnameshop.com', match: ['hyp.net'] },
	{ name: 'Metaname', domain: 'metaname.net', match: ['metaname.net'] },
	{ name: 'Register.it', domain: 'register.it', match: ['register.it'] },
	{ name: 'Fasthosts', domain: 'fasthosts.co.uk', match: ['livedns.co.uk'] },
	{
		name: 'Krystal',
		domain: 'krystal.uk',
		match: ['krystal.io', 'krystal.uk', 'cloudhosting.net', 'cloudhosting.uk', 'uksrv.co.uk'],
	},
	{ name: 'VentraIP', domain: 'ventraip.com.au', match: ['ventraip.net.au'] },
	{ name: 'Synergy Wholesale', domain: 'synergywholesale.com', match: ['nameserver.net.au'] },
	{
		name: 'Crazy Domains',
		domain: 'crazydomains.com',
		match: ['crazydomains.com', 'dnspackage.com', 'syrahost.com'],
	},
	{ name: 'Constellix', domain: 'constellix.com', match: ['constellix.com', 'constellix.net'] },
	{ name: 'Dynu', domain: 'dynu.com', match: ['dynu.com'] },
	{ name: 'FreeDNS', domain: 'freedns.afraid.org', match: ['afraid.org'] },
	{ name: 'Nameshield', domain: 'nameshield.com', match: ['perf1.fr', 'perf1.com'] },
	{ name: 'Register.com', domain: 'register.com', match: ['register.com'] },
	{ name: 'Domain.com', domain: 'domain.com', match: ['domain.com'] },
];

function nsHost(host: string): string {
	return host.trim().replace(/\.$/, '').toLowerCase();
}

export function detectDnsProvider(nameservers: string[]): DnsProvider | null {
	const hosts = nameservers.map(nsHost).filter(Boolean);
	if (hosts.length === 0) return null;

	const takeover = detectDomainTakeover(hosts);
	if (takeover) {
		const suffix = takeover.kind === 'seizure' ? 'seized domain' : 'sinkhole';
		return {
			name: `${takeover.operator} (${suffix})`,
			domain: takeover.domain,
			logo: takeover.logo,
		};
	}

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
