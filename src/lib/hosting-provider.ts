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
	{ name: 'Railway', domain: 'railway.com', match: ['railway'] },
	{ name: 'Render', domain: 'render.com', match: ['render'] },
	{ name: 'Fly.io', domain: 'fly.io', match: ['fly.io'] },
	{ name: 'IONOS', domain: 'ionos.com', match: ['ionos', '1&1', '1und1'] },
	{ name: 'netcup', domain: 'netcup.com', match: ['netcup'] },
	{ name: 'Contabo', domain: 'contabo.com', match: ['contabo'] },
	{ name: 'mittwald', domain: 'mittwald.de', match: ['mittwald'] },
	{ name: 'Vercel', domain: 'vercel.com', match: ['vercel'] },
	{ name: 'Akamai', domain: 'akamai.com', match: ['akamai', 'linode'] },
	{ name: 'Fastly', domain: 'fastly.com', match: ['fastly'] },
	{ name: 'Oracle Cloud', domain: 'oracle.com', match: ['oracle'] },
	{ name: 'Strato', domain: 'strato.de', match: ['strato'] },
	{ name: 'Host Europe', domain: 'hosteurope.de', match: ['host europe', 'hosteurope'] },
	{ name: 'Infomaniak', domain: 'infomaniak.com', match: ['infomaniak'] },
	{ name: 'GoDaddy', domain: 'godaddy.com', match: ['godaddy'] },
	{ name: 'Hostinger', domain: 'hostinger.com', match: ['hostinger'] },
	{ name: 'ALL-INKL', domain: 'all-inkl.com', match: ['medien muennich', 'all-inkl', 'kasserver'] },
	{ name: 'Aruba', domain: 'aruba.it', match: ['aruba'] },
	{ name: 'Wix', domain: 'wix.com', match: ['wix'] },
	{ name: 'Shopify', domain: 'shopify.com', match: ['shopify'] },
	{ name: 'Jimdo', domain: 'jimdo.com', match: ['jimdo'] },
	{ name: 'Onepage', domain: 'onepage.io', match: ['onepage'] },
	{ name: 'Squarespace', domain: 'squarespace.com', match: ['squarespace'] },
	{ name: 'Webflow', domain: 'webflow.com', match: ['webflow'] },
	{ name: 'Automattic', domain: 'automattic.com', match: ['automattic', 'wordpress.com', 'wpvip'] },
	{ name: 'Framer', domain: 'framer.com', match: ['framer'] },
	{ name: 'goneo', domain: 'goneo.de', match: ['goneo'] },
	{ name: 'ZAP-Hosting', domain: 'zap-hosting.com', match: ['zap-hosting', 'zaphosting'] },
	{ name: 'MC-HOST24', domain: 'mc-host24.de', match: ['mc-host24', 'mchost24'] },
	{ name: 'Scaleway', domain: 'scaleway.com', match: ['scaleway'] },
	{ name: 'Vultr', domain: 'vultr.com', match: ['vultr', 'the constant company', 'choopa'] },
	{ name: 'Leaseweb', domain: 'leaseweb.com', match: ['leaseweb'] },
	{ name: 'UpCloud', domain: 'upcloud.com', match: ['upcloud'] },
	{ name: 'Exoscale', domain: 'exoscale.com', match: ['exoscale', 'akenes'] },
	{ name: 'Gcore', domain: 'gcore.com', match: ['gcore', 'g-core'] },
	{ name: 'DreamHost', domain: 'dreamhost.com', match: ['dreamhost', 'new dream network'] },
	{ name: 'Alibaba Cloud', domain: 'alibabacloud.com', match: ['alibaba'] },
	{ name: 'Kamatera', domain: 'kamatera.com', match: ['kamatera'] },
	{ name: 'IBM Cloud', domain: 'ibm.com', match: ['ibm cloud', 'softlayer'] },
	{ name: 'Tencent Cloud', domain: 'tencentcloud.com', match: ['tencent'] },
	{ name: 'Huawei Cloud', domain: 'huaweicloud.com', match: ['huawei cloud', 'huaweicloud'] },
	{
		name: 'STACKIT',
		domain: 'stackit.com',
		match: ['stackit', 'schwarz digits cloud', 'schwarz it'],
	},
	{ name: 'Servers.com', domain: 'servers.com', match: ['servers.com'] },
	{
		name: 'phoenixNAP',
		domain: 'phoenixnap.com',
		match: ['phoenixnap', 'phoenix nap', 'secured servers'],
	},
	{ name: 'Liquid Web', domain: 'liquidweb.com', match: ['liquid web'] },
	{ name: 'Hostwinds', domain: 'hostwinds.com', match: ['hostwinds'] },
	{
		name: 'Cherry Servers',
		domain: 'cherryservers.com',
		match: ['cherry servers', 'cherryservers'],
	},
	{ name: 'Hivelocity', domain: 'hivelocity.net', match: ['hivelocity'] },
	{ name: 'HostDime', domain: 'hostdime.com', match: ['hostdime'] },
	{ name: 'ColoCrossing', domain: 'colocrossing.com', match: ['colocrossing', 'colo crossing'] },
	{ name: 'DataPacket', domain: 'datapacket.com', match: ['datapacket', 'datacamp limited'] },
	{ name: 'HostHatch', domain: 'hosthatch.com', match: ['hosthatch'] },
	{ name: 'BuyVM', domain: 'buyvm.net', match: ['buyvm', 'frantech'] },
	{ name: 'M247', domain: 'm247.com', match: ['m247'] },
	{ name: 'ServerMania', domain: 'servermania.com', match: ['servermania', 'b2 net solutions'] },
	{ name: 'KnownHost', domain: 'knownhost.com', match: ['knownhost'] },
	{ name: 'WebNX', domain: 'webnx.com', match: ['webnx'] },
	{ name: 'PQ.Hosting', domain: 'pq.hosting', match: ['pq hosting', 'pq.hosting'] },
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
