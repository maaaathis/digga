import type { RawRecord } from '@/lib/dns/types';

export type MailProvider = {
	name: string;
	domain: string;
};

type ProviderRule = MailProvider & {
	match: string[];
};

const PROVIDERS: ProviderRule[] = [
	{ name: 'Google Workspace', domain: 'google.com', match: ['google.com', 'googlemail.com'] },
	{
		name: 'Microsoft 365',
		domain: 'microsoft.com',
		match: ['mail.protection.outlook.com', 'outlook.com', 'office365.com'],
	},
	{ name: 'Zoho Mail', domain: 'zoho.com', match: ['zoho.com', 'zoho.eu', 'zohomail.com'] },
	{ name: 'Proton Mail', domain: 'proton.me', match: ['protonmail.ch', 'proton.me'] },
	{ name: 'iCloud Mail', domain: 'icloud.com', match: ['icloud.com', 'mail.me.com'] },
	{ name: 'Fastmail', domain: 'fastmail.com', match: ['messagingengine.com', 'fastmail.com'] },
	{ name: 'Yahoo Mail', domain: 'yahoo.com', match: ['yahoodns.net'] },
	{ name: 'GMX', domain: 'gmx.net', match: ['gmx.net'] },
	{ name: 'IONOS', domain: 'ionos.com', match: ['kundenserver.de', 'ionos.com', 'ionos.de'] },
	{ name: 'Mimecast', domain: 'mimecast.com', match: ['mimecast.com', 'mimecast.co.za'] },
	{ name: 'Proofpoint', domain: 'proofpoint.com', match: ['pphosted.com', 'ppe-hosted.com'] },
	{ name: 'Cloudflare Email Routing', domain: 'cloudflare.com', match: ['mx.cloudflare.net'] },
	{ name: 'Amazon SES', domain: 'aws.amazon.com', match: ['amazonaws.com', 'awsapps.com'] },
	{ name: 'mittwald', domain: 'mittwald.de', match: ['agenturserver.de'] },
	{ name: 'AnonAddy', domain: 'addy.io', match: ['anonaddy.me', 'addy.io'] },
	{ name: 'mailbox.org', domain: 'mailbox.org', match: ['mailbox.org'] },
	{ name: 'T-Online', domain: 't-online.de', match: ['t-online.de'] },
];

function mxHost(data: string): string {
	const parts = data.trim().split(/\s+/);
	const host = parts[parts.length - 1] ?? '';
	return host.replace(/\.$/, '').toLowerCase();
}

export function detectMailProvider(records: RawRecord[]): MailProvider | null {
	const hosts = records.map(record => mxHost(record.data)).filter(Boolean);
	if (hosts.length === 0) return null;

	for (const provider of PROVIDERS) {
		const isMatch = hosts.some(host =>
			provider.match.some(suffix => host === suffix || host.endsWith(`.${suffix}`)),
		);
		if (isMatch) return { name: provider.name, domain: provider.domain };
	}

	return null;
}
