export type TakeoverKind = 'seizure' | 'sinkhole';

export type DomainTakeover = {
	kind: TakeoverKind;
	operator: string;
	operatorLongName: string;
	domain: string;
	logo: string;
	nameservers: string[];
};

type Operator = {
	operator: string;
	operatorLongName: string;
	domain: string;
	logo: string;
};

const AGENCIES: Record<string, Operator> = {
	fbi: {
		operator: 'FBI',
		operatorLongName: 'the Federal Bureau of Investigation',
		domain: 'fbi.gov',
		logo: '/agencies/fbi.png',
	},
	hsi: {
		operator: 'HSI',
		operatorLongName: 'Homeland Security Investigations',
		domain: 'ice.gov',
		logo: '/agencies/ice.png',
	},
	usss: {
		operator: 'U.S. Secret Service',
		operatorLongName: 'the United States Secret Service',
		domain: 'secretservice.gov',
		logo: '/agencies/usss.png',
	},
	irs: {
		operator: 'IRS-CI',
		operatorLongName: 'IRS Criminal Investigation',
		domain: 'irs.gov',
		logo: '/agencies/irs.png',
	},
	uspis: {
		operator: 'USPIS',
		operatorLongName: 'the United States Postal Inspection Service',
		domain: 'uspis.gov',
		logo: '/agencies/uspis.png',
	},
	dea: {
		operator: 'DEA',
		operatorLongName: 'the Drug Enforcement Administration',
		domain: 'dea.gov',
		logo: '/agencies/dea.png',
	},
	atf: {
		operator: 'ATF',
		operatorLongName: 'the Bureau of Alcohol, Tobacco, Firearms and Explosives',
		domain: 'atf.gov',
		logo: '/agencies/atf.png',
	},
};

const AGENCY_ALIASES: Record<string, string> = {
	'ice': 'hsi',
	'irs-ci': 'irs',
};

const UNKNOWN_AGENCY: Operator = {
	operator: 'U.S. law enforcement',
	operatorLongName: 'a United States law enforcement agency',
	domain: 'justice.gov',
	logo: '/agencies/justice.png',
};

const MICROSOFT_DCU: Operator = {
	operator: 'Microsoft DCU',
	operatorLongName: "Microsoft's Digital Crimes Unit",
	domain: 'microsoft.com',
	logo: '/agencies/microsoft.png',
};

const SHADOWSERVER: Operator = {
	operator: 'Shadowserver',
	operatorLongName: 'the Shadowserver Foundation',
	domain: 'shadowserver.org',
	logo: '/agencies/shadowserver.png',
};

type Rule = {
	zone: string;
	kind: TakeoverKind;
	operator?: Operator;
	byAgencyLabel?: boolean;
};

const RULES: Rule[] = [
	{ zone: 'seized.gov', kind: 'seizure', byAgencyLabel: true },
	{ zone: 'seizedservers.com', kind: 'seizure', operator: AGENCIES.hsi },
	{ zone: 'microsoftinternetsafety.net', kind: 'sinkhole', operator: MICROSOFT_DCU },
	{ zone: 'sinkhole.shadowserver.org', kind: 'sinkhole', operator: SHADOWSERVER },
];

function nsHost(host: string): string {
	return host.trim().replace(/\.$/, '').toLowerCase();
}

function inZone(host: string, zone: string): boolean {
	return host === zone || host.endsWith(`.${zone}`);
}

function agencyLabel(host: string, zone: string): string | null {
	const prefix = host.slice(0, -`.${zone}`.length);
	const labels = prefix.split('.');
	return labels.length >= 2 ? (labels.at(-1) ?? null) : null;
}

function operatorFor(rule: Rule, hosts: string[]): Operator {
	if (rule.operator) return rule.operator;
	const label = hosts.map(host => agencyLabel(host, rule.zone)).find(Boolean) ?? '';
	return AGENCIES[AGENCY_ALIASES[label] ?? label] ?? UNKNOWN_AGENCY;
}

export function detectDomainTakeover(nameservers: string[]): DomainTakeover | null {
	const hosts = nameservers.map(nsHost).filter(Boolean);
	if (hosts.length === 0) return null;

	for (const rule of RULES) {
		const matched = hosts.filter(host => inZone(host, rule.zone));
		if (matched.length === 0) continue;
		return {
			kind: rule.kind,
			...operatorFor(rule, matched),
			nameservers: [...new Set(matched)],
		};
	}

	return null;
}
