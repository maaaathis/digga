import type { NormalizedRdap, RdapDomain, RdapEntity, RdapVcardArrayField } from './types';

function vcardField(entity: RdapEntity | undefined, field: string): string | undefined {
	if (!entity?.vcardArray) return undefined;
	const [, entries] = entity.vcardArray;
	const match = entries.find(
		(entry): entry is RdapVcardArrayField => Array.isArray(entry) && entry[0] === field,
	);
	if (!match) return undefined;

	const value = match[3];
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return value.filter(Boolean).join(', ');
	return undefined;
}

function findEntity(entities: RdapEntity[] | undefined, role: string): RdapEntity | undefined {
	if (!entities) return undefined;
	for (const entity of entities) {
		if (entity.roles?.includes(role)) return entity;
		const nested = findEntity(entity.entities, role);
		if (nested) return nested;
	}
	return undefined;
}

function abuseEmail(registrar: RdapEntity | undefined): string | undefined {
	if (!registrar?.entities) return undefined;
	const abuse = findEntity(registrar.entities, 'abuse');
	return vcardField(abuse, 'email');
}

export function normalizeRdap(domain: string, server: string, data: RdapDomain): NormalizedRdap {
	const registrarEntity = findEntity(data.entities, 'registrar');
	const registrantEntity = findEntity(data.entities, 'registrant');

	const registrarIanaId = registrarEntity?.publicIds?.find(id =>
		id.type.toLowerCase().includes('iana'),
	)?.identifier;

	return {
		domain,
		source: 'rdap',
		server,
		registrar: {
			name: vcardField(registrarEntity, 'fn'),
			ianaId: registrarIanaId,
			abuseEmail: abuseEmail(registrarEntity),
		},
		registrant: {
			name: vcardField(registrantEntity, 'fn'),
			organization: vcardField(registrantEntity, 'org'),
			country:
				vcardField(registrantEntity, 'country-name') ??
				(vcardField(registrantEntity, 'adr') || '').split(',').pop()?.trim(),
		},
		events: (data.events ?? []).map(event => ({
			action: event.eventAction,
			date: event.eventDate,
		})),
		status: data.status ?? [],
		nameservers: (data.nameservers ?? [])
			.map(ns => ns.ldhName || ns.unicodeName || '')
			.filter(Boolean)
			.map(ns => ns.toLowerCase()),
		dnssec:
			typeof data.secureDNS?.delegationSigned === 'boolean'
				? data.secureDNS.delegationSigned
				: null,
		raw: data,
	};
}
