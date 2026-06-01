import 'server-only';

import tls from 'node:tls';

export type TlsChainEntry = {
	subject: string | null;
	issuer: string | null;
};

export type TlsCertificate = {
	host: string;
	valid: boolean;
	authorizationError: string | null;
	issuerCommonName: string | null;
	issuerOrg: string | null;
	subjectCommonName: string | null;
	subjectAltNames: string[];
	validFrom: string;
	validTo: string;
	daysRemaining: number;
	expired: boolean;
	notYetValid: boolean;
	protocol: string | null;
	cipher: string | null;
	keyType: string | null;
	serialNumber: string | null;
	fingerprint256: string | null;
	chain: TlsChainEntry[];
};

export type TlsErrorReason = 'timeout' | 'refused' | 'dns' | 'no-tls' | 'unknown';

export type TlsResult =
	| { kind: 'ok'; certificate: TlsCertificate }
	| { kind: 'error'; reason: TlsErrorReason; message: string };

const PORT = 443;
const TIMEOUT_MS = 8000;
const DAY_MS = 86_400_000;

type PeerCert = tls.DetailedPeerCertificate;

function commonName(field: tls.PeerCertificate['subject'] | undefined): string | null {
	if (!field || typeof field !== 'object') return null;
	const cn = (field as { CN?: string }).CN;
	return typeof cn === 'string' && cn.length > 0 ? cn : null;
}

function organization(field: tls.PeerCertificate['issuer'] | undefined): string | null {
	if (!field || typeof field !== 'object') return null;
	const org = (field as { O?: string }).O;
	return typeof org === 'string' && org.length > 0 ? org : null;
}

function parseSans(raw: string | undefined): string[] {
	if (!raw) return [];
	return raw
		.split(',')
		.map(entry => entry.trim().replace(/^DNS:/i, ''))
		.filter(entry => entry.length > 0);
}

function detectKeyType(cert: PeerCert): string | null {
	const asn1Curve = (cert as unknown as { asn1Curve?: string }).asn1Curve;
	if (asn1Curve) return `ECDSA ${asn1Curve}`;
	if (typeof cert.bits === 'number') return `RSA ${cert.bits}`;
	return null;
}

function describe(field: tls.PeerCertificate['subject'] | undefined): string | null {
	const cn = commonName(field);
	const org = organization(field);
	if (cn && org && cn !== org) return `${cn} (${org})`;
	return cn ?? org;
}

function buildChain(leaf: PeerCert): TlsChainEntry[] {
	const chain: TlsChainEntry[] = [];
	const seen = new Set<string>();
	let current: PeerCert | undefined = leaf;
	while (current && current.fingerprint256 && !seen.has(current.fingerprint256)) {
		seen.add(current.fingerprint256);
		chain.push({
			subject: describe(current.subject),
			issuer: describe(current.issuer),
		});
		const next: PeerCert | undefined = current.issuerCertificate;
		// A root cert points its issuerCertificate back at itself; stop there.
		if (!next || next === current || next.fingerprint256 === current.fingerprint256) break;
		current = next;
	}
	return chain;
}

function classifyError(error: NodeJS.ErrnoException): TlsErrorReason {
	switch (error.code) {
		case 'ETIMEDOUT':
		case 'ESOCKETTIMEDOUT':
			return 'timeout';
		case 'ECONNREFUSED':
		case 'ECONNRESET':
			return 'refused';
		case 'ENOTFOUND':
		case 'EAI_AGAIN':
			return 'dns';
		case 'EPROTO':
		case 'ERR_SSL_WRONG_VERSION_NUMBER':
			return 'no-tls';
		default:
			return 'unknown';
	}
}

export async function getTlsCertificate(host: string): Promise<TlsResult> {
	return new Promise<TlsResult>(resolve => {
		let settled = false;
		const finish = (result: TlsResult) => {
			if (settled) return;
			settled = true;
			socket.destroy();
			resolve(result);
		};

		const socket = tls.connect({
			host,
			port: PORT,
			servername: host,
			rejectUnauthorized: false,
			ALPNProtocols: ['h2', 'http/1.1'],
		});

		socket.setTimeout(TIMEOUT_MS);

		socket.on('secureConnect', () => {
			const cert = socket.getPeerCertificate(true);
			if (!cert || Object.keys(cert).length === 0) {
				finish({ kind: 'error', reason: 'no-tls', message: 'No certificate presented.' });
				return;
			}

			const validFrom = new Date(cert.valid_from);
			const validTo = new Date(cert.valid_to);
			const now = Date.now();
			const cipher = socket.getCipher();

			finish({
				kind: 'ok',
				certificate: {
					host,
					valid: socket.authorized,
					authorizationError: socket.authorized
						? null
						: (socket.authorizationError?.toString() ?? 'unknown'),
					issuerCommonName: commonName(cert.issuer),
					issuerOrg: organization(cert.issuer),
					subjectCommonName: commonName(cert.subject),
					subjectAltNames: parseSans(cert.subjectaltname),
					validFrom: validFrom.toISOString(),
					validTo: validTo.toISOString(),
					daysRemaining: Math.ceil((validTo.getTime() - now) / DAY_MS),
					expired: validTo.getTime() < now,
					notYetValid: validFrom.getTime() > now,
					protocol: socket.getProtocol(),
					cipher: cipher ? `${cipher.name} (${cipher.version})` : null,
					keyType: detectKeyType(cert),
					serialNumber: cert.serialNumber ?? null,
					fingerprint256: cert.fingerprint256 ?? null,
					chain: buildChain(cert),
				},
			});
		});

		socket.on('timeout', () => {
			finish({ kind: 'error', reason: 'timeout', message: 'Connection timed out.' });
		});

		socket.on('error', (error: NodeJS.ErrnoException) => {
			finish({ kind: 'error', reason: classifyError(error), message: error.message });
		});
	});
}
