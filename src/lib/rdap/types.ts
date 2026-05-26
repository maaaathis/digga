export type RdapVcardArrayField = [
	string,
	Record<string, unknown>,
	string,
	string | string[] | Record<string, unknown>,
];

export type RdapVcardArray = ['vcard', RdapVcardArrayField[]];

export type RdapEntity = {
	objectClassName: 'entity';
	handle?: string;
	roles?: string[];
	vcardArray?: RdapVcardArray;
	entities?: RdapEntity[];
	events?: RdapEvent[];
	publicIds?: { type: string; identifier: string }[];
};

export type RdapEvent = {
	eventAction: string;
	eventDate: string;
	eventActor?: string;
};

export type RdapNameserver = {
	objectClassName: 'nameserver';
	ldhName?: string;
	unicodeName?: string;
	ipAddresses?: { v4?: string[]; v6?: string[] };
};

export type RdapStatus = string[];

export type RdapDomain = {
	objectClassName: 'domain';
	handle?: string;
	ldhName?: string;
	unicodeName?: string;
	status?: RdapStatus;
	entities?: RdapEntity[];
	events?: RdapEvent[];
	nameservers?: RdapNameserver[];
	secureDNS?: {
		delegationSigned?: boolean;
		dsData?: {
			keyTag: number;
			algorithm: number;
			digestType: number;
			digest: string;
		}[];
	};
	notices?: { title?: string; description?: string[]; links?: { href: string }[] }[];
	links?: { rel?: string; href: string; type?: string }[];
	port43?: string;
	errorCode?: number;
	title?: string;
	description?: string[];
};

export type NormalizedRdap = {
	domain: string;
	source: 'rdap';
	server: string;
	registrar?: { name?: string; ianaId?: string; abuseEmail?: string };
	registrant?: { name?: string; organization?: string; country?: string };
	events: { action: string; date: string }[];
	status: string[];
	nameservers: string[];
	dnssec: boolean | null;
	raw: RdapDomain;
};
