import type { DoHResponse } from '@/lib/dns/types';

const DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';
const TXT_TYPE = 16;

const COMMON_DKIM_SELECTORS = [
	'agenturserver',
	'agenturserver2048',
	'default',
	'google',
	'selector1',
	'selector2',
	's1',
	's2',
	's1-ionos',
	's2-ionos',
	's42582890',
	'k1',
	'mail',
	'dkim',
	'smtp',
	'resend',
	'mandrill',
	'mailjet',
	'mxvault',
	'zoho',
	'fm1',
	'fm2',
	'fm3',
	'protonmail',
	'protonmail2',
	'amazonses',
	'sendgrid',
	'em',
	'mte1',
	'zupost',
] as const;

export type CheckLevel = 'pass' | 'warn' | 'fail' | 'info';
export type CheckStatus = 'pass' | 'warn' | 'fail' | 'none';

export type CheckFinding = {
	level: CheckLevel;
	message: string;
};

export type CheckDetail = {
	label: string;
	value: string;
};

export type EmailCheckId = 'spf' | 'dkim' | 'dmarc' | 'mta-sts' | 'tls-rpt' | 'bimi';

export type EmailCheck = {
	id: EmailCheckId;
	title: string;
	tagline: string;
	status: CheckStatus;
	summary: string;
	record: string | null;
	findings: CheckFinding[];
	details: CheckDetail[];
};

export type EmailSecurityReport = {
	domain: string;
	checks: EmailCheck[];
	tally: { pass: number; warn: number; fail: number; none: number };
};

function unquoteTxt(data: string): string {
	const segments = data.match(/"([^"]*)"/g);
	if (segments) return segments.map(segment => segment.slice(1, -1)).join('');
	return data;
}

async function fetchTxt(name: string, signal?: AbortSignal): Promise<string[]> {
	const url = `${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=TXT`;
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: { Accept: 'application/dns-json' },
			signal,
		});
		if (!response.ok) return [];
		const json = (await response.json()) as DoHResponse;
		if (!json.Answer) return [];
		return json.Answer.filter(answer => answer.type === TXT_TYPE).map(answer =>
			unquoteTxt(answer.data),
		);
	} catch {
		return [];
	}
}

function parseTagRecord(record: string): Record<string, string> {
	const tags: Record<string, string> = {};
	for (const part of record.split(';')) {
		const [rawKey, ...rest] = part.split('=');
		const key = rawKey.trim().toLowerCase();
		if (!key || rest.length === 0) continue;
		tags[key] = rest.join('=').trim();
	}
	return tags;
}

const SPF_LOOKUP_LIMIT = 10;

type SpfCounter = { lookups: number; queries: number; exceeded: boolean };

async function countSpfLookups(
	record: string,
	counter: SpfCounter,
	visited: Set<string>,
	signal?: AbortSignal,
): Promise<void> {
	const mechanisms = record.trim().split(/\s+/);
	const nested: string[] = [];

	for (const mechanism of mechanisms) {
		const token = mechanism.replace(/^[-~?+]/, '');
		const lower = token.toLowerCase();

		if (
			lower === 'a' ||
			lower.startsWith('a:') ||
			lower.startsWith('a/') ||
			lower === 'mx' ||
			lower.startsWith('mx:') ||
			lower.startsWith('mx/') ||
			lower === 'ptr' ||
			lower.startsWith('ptr:') ||
			lower.startsWith('exists:')
		) {
			counter.lookups += 1;
		} else if (lower.startsWith('include:')) {
			counter.lookups += 1;
			nested.push(token.slice('include:'.length));
		} else if (lower.startsWith('redirect=')) {
			counter.lookups += 1;
			nested.push(token.slice('redirect='.length));
		}
	}

	if (counter.lookups > SPF_LOOKUP_LIMIT) counter.exceeded = true;

	for (const target of nested) {
		if (counter.exceeded || counter.queries >= 30) return;
		const domain = target.toLowerCase();
		if (visited.has(domain)) continue;
		visited.add(domain);

		counter.queries += 1;
		const txts = await fetchTxt(domain, signal);
		const spf = txts.find(txt => /^v=spf1\b/i.test(txt.trim()));
		if (spf) await countSpfLookups(spf, counter, visited, signal);
	}
}

function none(id: EmailCheckId, title: string, tagline: string, summary: string): EmailCheck {
	return { id, title, tagline, status: 'none', summary, record: null, findings: [], details: [] };
}

async function checkSpf(domain: string, signal?: AbortSignal): Promise<EmailCheck> {
	const title = 'SPF';
	const tagline = 'Authorizes which servers may send mail for the domain';
	const txts = await fetchTxt(domain, signal);
	const records = txts.filter(txt => /^v=spf1\b/i.test(txt.trim()));

	if (records.length === 0) {
		return {
			...none(
				'spf',
				title,
				tagline,
				'No SPF record. Receivers cannot tell which servers may send as this domain.',
			),
			status: 'fail',
			findings: [
				{ level: 'fail', message: 'No v=spf1 TXT record found on the domain.' },
				{
					level: 'info',
					message: 'Without SPF, anyone can forge mail from this domain more easily.',
				},
			],
		};
	}

	const findings: CheckFinding[] = [];
	let status: CheckStatus = 'pass';

	if (records.length > 1) {
		status = 'fail';
		findings.push({
			level: 'fail',
			message: `Found ${records.length} SPF records. RFC 7208 allows exactly one; multiple records cause a permerror.`,
		});
	}

	const record = records[0];

	const allMatch = record.match(/([-~?+]?)all\b/i);
	const qualifier = allMatch ? allMatch[1] || '+' : null;
	if (qualifier === '-') {
		findings.push({
			level: 'pass',
			message: 'Ends in -all (hardfail): unauthorized senders are rejected.',
		});
	} else if (qualifier === '~') {
		findings.push({
			level: 'pass',
			message: 'Ends in ~all (softfail): unauthorized senders are marked, not rejected.',
		});
	} else if (qualifier === '?') {
		if (status === 'pass') status = 'warn';
		findings.push({
			level: 'warn',
			message: 'Ends in ?all (neutral): the policy effectively allows anyone.',
		});
	} else if (qualifier === '+') {
		status = 'fail';
		findings.push({
			level: 'fail',
			message: 'Ends in +all: any server is authorized to send. This defeats SPF.',
		});
	} else {
		if (status === 'pass') status = 'warn';
		findings.push({
			level: 'warn',
			message: 'No all mechanism: the record has no default policy for unlisted senders.',
		});
	}

	const counter: SpfCounter = { lookups: 0, queries: 0, exceeded: false };
	await countSpfLookups(record, counter, new Set([domain.toLowerCase()]), signal);
	const lookupLabel = counter.exceeded ? `>${SPF_LOOKUP_LIMIT}` : String(counter.lookups);
	if (counter.exceeded || counter.lookups > SPF_LOOKUP_LIMIT) {
		status = 'fail';
		findings.push({
			level: 'fail',
			message: `SPF evaluation needs ${lookupLabel} DNS lookups, over the limit of ${SPF_LOOKUP_LIMIT}. Receivers return permerror and SPF fails.`,
		});
	} else if (counter.lookups > 7) {
		if (status === 'pass') status = 'warn';
		findings.push({
			level: 'warn',
			message: `Uses ${counter.lookups} of ${SPF_LOOKUP_LIMIT} allowed DNS lookups. Close to the limit.`,
		});
	} else {
		findings.push({
			level: 'pass',
			message: `Uses ${counter.lookups} of ${SPF_LOOKUP_LIMIT} allowed DNS lookups.`,
		});
	}

	const summary =
		status === 'pass'
			? 'SPF is published and within limits.'
			: status === 'warn'
				? 'SPF is published but could be tightened.'
				: 'SPF is published but misconfigured.';

	return {
		id: 'spf',
		title,
		tagline,
		status,
		summary,
		record,
		findings,
		details: [
			{ label: 'Policy', value: qualifier ? `${qualifier}all` : 'none' },
			{ label: 'DNS lookups', value: `${lookupLabel} / ${SPF_LOOKUP_LIMIT}` },
		],
	};
}

async function checkDmarc(domain: string, signal?: AbortSignal): Promise<EmailCheck> {
	const title = 'DMARC';
	const tagline = 'Tells receivers what to do with mail that fails SPF and DKIM';
	const txts = await fetchTxt(`_dmarc.${domain}`, signal);
	const record = txts.find(txt => /^v=DMARC1\b/i.test(txt.trim()));

	if (!record) {
		return {
			...none(
				'dmarc',
				title,
				tagline,
				'No DMARC record. Failing mail is not actively rejected or quarantined.',
			),
			status: 'fail',
			findings: [
				{ level: 'fail', message: 'No v=DMARC1 TXT record found at _dmarc.' + domain },
				{ level: 'info', message: 'DMARC ties SPF and DKIM together and enables reporting.' },
			],
		};
	}

	const tags = parseTagRecord(record);
	const policy = (tags['p'] ?? 'none').toLowerCase();
	const subPolicy = tags['sp']?.toLowerCase();
	const pct = tags['pct'] ? Number(tags['pct']) : 100;
	const findings: CheckFinding[] = [];
	let status: CheckStatus = 'pass';

	if (policy === 'reject') {
		findings.push({
			level: 'pass',
			message: 'Policy p=reject: failing mail is rejected outright.',
		});
	} else if (policy === 'quarantine') {
		findings.push({ level: 'pass', message: 'Policy p=quarantine: failing mail is sent to spam.' });
	} else {
		status = 'warn';
		findings.push({
			level: 'warn',
			message: 'Policy p=none: DMARC is in monitoring mode only and does not block spoofed mail.',
		});
	}

	if (Number.isFinite(pct) && pct < 100) {
		if (status === 'pass') status = 'warn';
		findings.push({
			level: 'warn',
			message: `pct=${pct}: the policy only applies to ${pct}% of mail.`,
		});
	}

	if (tags['rua']) {
		findings.push({ level: 'pass', message: 'Aggregate reports (rua) are configured.' });
	} else {
		if (status === 'pass') status = 'warn';
		findings.push({
			level: 'warn',
			message: 'No rua address: you receive no aggregate reports to monitor abuse.',
		});
	}

	const details: CheckDetail[] = [{ label: 'Policy', value: `p=${policy}` }];
	if (subPolicy) details.push({ label: 'Subdomains', value: `sp=${subPolicy}` });
	if (Number.isFinite(pct)) details.push({ label: 'Coverage', value: `${pct}%` });

	const summary =
		status === 'pass' ? 'DMARC is enforced.' : 'DMARC is published but not fully enforcing.';

	return { id: 'dmarc', title, tagline, status, summary, record, findings, details };
}

async function checkDkim(domain: string, signal?: AbortSignal): Promise<EmailCheck> {
	const title = 'DKIM';
	const tagline = 'Cryptographically signs outgoing mail (best-effort selector probe)';

	const results = await Promise.all(
		COMMON_DKIM_SELECTORS.map(async selector => {
			const txts = await fetchTxt(`${selector}._domainkey.${domain}`, signal);
			let outcome: 'valid' | 'revoked' | null = null;
			for (const txt of txts) {
				const isDkim = /(^|;)\s*v=DKIM1\b/i.test(txt) || /(^|;)\s*k=/i.test(txt);
				if (!isDkim) continue;
				// RFC 6376 §3.6.1: an empty p= value means the key has been revoked.
				const match = txt.match(/(?:^|;)\s*p=([^;]*)/i);
				const key = match ? match[1].trim() : '';
				if (key.length > 0) {
					outcome = 'valid';
					break;
				}
				outcome = 'revoked';
			}
			return { selector, outcome };
		}),
	);
	const selectors = results
		.filter(result => result.outcome === 'valid')
		.map(result => result.selector);
	const revoked = results.some(result => result.outcome === 'revoked');

	if (selectors.length === 0) {
		if (revoked) {
			return {
				id: 'dkim',
				title,
				tagline,
				status: 'none',
				summary: 'Only revoked DKIM keys (empty p=) are published.',
				record: null,
				findings: [
					{
						level: 'info',
						message:
							'A DKIM record with an empty p= value signals a revoked key, i.e. the domain publishes no active signing key (often a deliberate "sends no mail" marker).',
					},
				],
				details: [],
			};
		}
		return {
			id: 'dkim',
			title,
			tagline,
			status: 'none',
			summary: 'No DKIM key found for common selectors.',
			record: null,
			findings: [
				{
					level: 'info',
					message:
						'DKIM selectors cannot be enumerated from DNS, so this only probes well-known selectors. A negative result is not proof that DKIM is missing.',
				},
			],
			details: [{ label: 'Selectors probed', value: String(COMMON_DKIM_SELECTORS.length) }],
		};
	}

	return {
		id: 'dkim',
		title,
		tagline,
		status: 'pass',
		summary: `DKIM key published for ${selectors.length} known selector${selectors.length === 1 ? '' : 's'}.`,
		record: null,
		findings: selectors.map(selector => ({
			level: 'pass' as const,
			message: `Found a DKIM key at ${selector}._domainkey.${domain}`,
		})),
		details: [{ label: 'Selectors', value: selectors.join(', ') }],
	};
}

async function checkMtaSts(domain: string, signal?: AbortSignal): Promise<EmailCheck> {
	const title = 'MTA-STS';
	const tagline = 'Enforces TLS for inbound mail and prevents downgrade attacks';
	const txts = await fetchTxt(`_mta-sts.${domain}`, signal);
	const record = txts.find(txt => /^v=STSv1\b/i.test(txt.trim()));

	let policyMode: string | null = null;
	let policyMaxAge: string | null = null;
	try {
		const response = await fetch(`https://mta-sts.${domain}/.well-known/mta-sts.txt`, {
			signal: signal ?? AbortSignal.timeout(5000),
		});
		if (response.ok) {
			const text = await response.text();
			for (const line of text.split(/\r?\n/)) {
				const [key, value] = line.split(':');
				if (!value) continue;
				const trimmedKey = key.trim().toLowerCase();
				if (trimmedKey === 'mode') policyMode = value.trim().toLowerCase();
				if (trimmedKey === 'max_age') policyMaxAge = value.trim();
			}
		}
	} catch {
		// Policy file is optional / may time out; the DNS record alone is enough to report on.
	}

	if (!record) {
		return none(
			'mta-sts',
			title,
			tagline,
			'No MTA-STS policy. Inbound mail can be delivered without TLS.',
		);
	}

	const findings: CheckFinding[] = [];
	let status: CheckStatus = 'pass';

	if (policyMode === 'enforce') {
		findings.push({
			level: 'pass',
			message: 'Policy mode is enforce: TLS is required for inbound mail.',
		});
	} else if (policyMode === 'testing') {
		status = 'warn';
		findings.push({
			level: 'warn',
			message: 'Policy mode is testing: failures are reported but mail is still delivered.',
		});
	} else if (policyMode === 'none') {
		status = 'warn';
		findings.push({
			level: 'warn',
			message: 'Policy mode is none: MTA-STS is effectively disabled.',
		});
	} else {
		status = 'warn';
		findings.push({
			level: 'warn',
			message: 'The DNS record exists but the policy file could not be read.',
		});
	}

	const details: CheckDetail[] = [];
	if (policyMode) details.push({ label: 'Mode', value: policyMode });
	if (policyMaxAge) details.push({ label: 'Max age', value: `${policyMaxAge}s` });

	return {
		id: 'mta-sts',
		title,
		tagline,
		status,
		summary:
			status === 'pass' ? 'MTA-STS is enforcing TLS.' : 'MTA-STS is published but not enforcing.',
		record,
		findings,
		details,
	};
}

async function checkTlsRpt(domain: string, signal?: AbortSignal): Promise<EmailCheck> {
	const title = 'TLS-RPT';
	const tagline = 'Receives reports about TLS delivery failures';
	const txts = await fetchTxt(`_smtp._tls.${domain}`, signal);
	const record = txts.find(txt => /^v=TLSRPTv1\b/i.test(txt.trim()));

	if (!record) {
		return none(
			'tls-rpt',
			title,
			tagline,
			'No TLS-RPT record. You get no reports about failed TLS delivery.',
		);
	}

	const tags = parseTagRecord(record);
	return {
		id: 'tls-rpt',
		title,
		tagline,
		status: 'pass',
		summary: 'TLS reporting is configured.',
		record,
		findings: [{ level: 'pass', message: 'TLS delivery failure reports are being collected.' }],
		details: tags['rua'] ? [{ label: 'Reports to', value: tags['rua'] }] : [],
	};
}

async function checkBimi(
	domain: string,
	dmarcEnforced: boolean,
	signal?: AbortSignal,
): Promise<EmailCheck> {
	const title = 'BIMI';
	const tagline = 'Displays your verified brand logo in supporting inboxes';
	const txts = await fetchTxt(`default._bimi.${domain}`, signal);
	const record = txts.find(txt => /^v=BIMI1\b/i.test(txt.trim()));

	if (!record) {
		return none('bimi', title, tagline, 'No BIMI record. No brand logo is published for inboxes.');
	}

	const tags = parseTagRecord(record);
	const findings: CheckFinding[] = [];
	let status: CheckStatus = 'pass';

	if (tags['l']) {
		findings.push({ level: 'pass', message: 'A logo (l=) is published.' });
	} else {
		status = 'warn';
		findings.push({ level: 'warn', message: 'BIMI record has no l= logo URL.' });
	}
	if (tags['a']) {
		findings.push({ level: 'pass', message: 'A Verified Mark Certificate (a=) is referenced.' });
	}
	if (!dmarcEnforced) {
		status = 'warn';
		findings.push({
			level: 'warn',
			message: 'BIMI requires an enforcing DMARC policy (quarantine or reject) to be honored.',
		});
	}

	const details: CheckDetail[] = [];
	if (tags['l']) details.push({ label: 'Logo', value: tags['l'] });
	if (tags['a']) details.push({ label: 'VMC', value: tags['a'] });

	return {
		id: 'bimi',
		title,
		tagline,
		status,
		summary: status === 'pass' ? 'BIMI is published.' : 'BIMI is published with caveats.',
		record,
		findings,
		details,
	};
}

/**
 * Lightweight SPF + DMARC check for the overview tab. Skips the slower DKIM
 * selector probing and MTA-STS policy fetch so it stays cheap on the hot path.
 */
export async function analyzeEmailEssentials(
	domain: string,
): Promise<{ spf: EmailCheck; dmarc: EmailCheck }> {
	const signal = AbortSignal.timeout(8000);
	const [spf, dmarc] = await Promise.all([checkSpf(domain, signal), checkDmarc(domain, signal)]);
	return { spf, dmarc };
}

export async function analyzeEmailSecurity(domain: string): Promise<EmailSecurityReport> {
	const signal = AbortSignal.timeout(12000);

	const [spf, dmarc, dkim, mtaSts, tlsRpt] = await Promise.all([
		checkSpf(domain, signal),
		checkDmarc(domain, signal),
		checkDkim(domain, signal),
		checkMtaSts(domain, signal),
		checkTlsRpt(domain, signal),
	]);

	const dmarcEnforced =
		dmarc.status === 'pass' || /p=(quarantine|reject)/i.test(dmarc.record ?? '');
	const bimi = await checkBimi(domain, dmarcEnforced, signal);

	const checks = [spf, dkim, dmarc, mtaSts, tlsRpt, bimi];
	const tally = checks.reduce(
		(acc, check) => {
			acc[check.status] += 1;
			return acc;
		},
		{ pass: 0, warn: 0, fail: 0, none: 0 },
	);

	return { domain, checks, tally };
}
