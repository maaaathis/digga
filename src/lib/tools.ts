export type ToolSlug = 'dns' | 'whois' | 'rdap' | 'subdomains' | 'email' | 'tls';

export type ToolIconKey = 'dns' | 'whois' | 'rdap' | 'subdomains' | 'email' | 'tls';

export type Tool = {
	slug: ToolSlug;
	lookupSegment: string;
	iconKey: ToolIconKey;
	eyebrow: string;
	name: string;
	h1: string;
	title: string;
	description: string;
	keywords: string[];
	heroSubtitle: string;
	bullets: { title: string; body: string }[];
	sections: { heading: string; body: string }[];
	faq: { q: string; a: string }[];
	related: ToolSlug[];
};

export const TOOLS: Record<ToolSlug, Tool> = {
	dns: {
		slug: 'dns',
		lookupSegment: 'dns',
		iconKey: 'dns',
		eyebrow: 'DNS records',
		name: 'DNS Lookup',
		h1: 'Free DNS Lookup',
		title: 'DNS Lookup · A, AAAA, MX, TXT, NS, CAA Records',
		description:
			'Free DNS lookup for any domain. Check A, AAAA, MX, NS, TXT, CAA, and DNSSEC records live via Cloudflare, Google, and Alibaba DNS over HTTPS.',
		keywords: [
			'dns lookup',
			'dns checker',
			'dns records',
			'a record lookup',
			'aaaa record lookup',
			'mx record lookup',
			'txt record lookup',
			'ns lookup',
			'cname lookup',
			'caa record lookup',
			'soa record',
			'dns over https',
			'dnssec lookup',
		],
		heroSubtitle:
			'Run a DNS lookup for any domain. See A, AAAA, MX, NS, TXT, CAA, SOA, SRV, and DNSSEC records resolved live through Cloudflare, Google, or Alibaba DNS over HTTPS.',
		bullets: [
			{
				title: 'Every record type',
				body: 'A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, PTR, NAPTR, CAA, DNSKEY, and DS. The full set, grouped by type so you can scan it fast.',
			},
			{
				title: 'Live resolver switch',
				body: 'Query Cloudflare 1.1.1.1, Google 8.8.8.8, or Alibaba DNS and compare answers without reloading. Responses go straight from the resolver to your browser.',
			},
			{
				title: 'Exact TTL values',
				body: 'Hover any record to read its time to live in seconds, so you know how long a change takes before resolvers refresh it.',
			},
			{
				title: 'DNSSEC signals',
				body: 'DNSKEY and DS records surface automatically when the zone is signed, so you can confirm the chain of trust at a glance.',
			},
		],
		sections: [
			{
				heading: 'What is a DNS lookup?',
				body: 'A DNS lookup asks the Domain Name System which servers and addresses a domain points to. Every time you open a website, send an email, or connect an app, a resolver walks the DNS hierarchy and translates the human readable name into the records that route the traffic. digga runs that query on demand and shows you the raw answer for every record type, so you can debug a deploy, verify a migration, or simply understand how a domain is wired.',
			},
			{
				heading: 'Which DNS records can I check?',
				body: 'A and AAAA records map the domain to IPv4 and IPv6 addresses. CNAME points one name at another. MX lists the mail servers. NS names the authoritative nameservers. TXT carries verification strings and policies like SPF and DMARC. SOA holds the zone metadata, SRV advertises services, and CAA controls which certificate authorities may issue a certificate. DNSKEY and DS expose the DNSSEC chain. digga returns all of them in one pass.',
			},
			{
				heading: 'Choosing a resolver',
				body: 'digga ships three public DNS over HTTPS resolvers: Cloudflare, Google, and Alibaba. Switching between them live is the quickest way to spot a stale cache, a split horizon answer, or a record that has not finished propagating. Because the lookup runs over DoH from your browser, the answer you see is the answer that resolver is actually serving right now.',
			},
			{
				heading: 'DNS and DNSSEC',
				body: 'DNSSEC signs DNS answers so a resolver can prove they were not tampered with on the way. When a zone is signed, the parent publishes a DS record and the zone publishes DNSKEY records. digga surfaces both when the resolver returns them, and the overview page reports whether the parent delegation is signed, so you can confirm a domain is protected against spoofed responses.',
			},
		],
		faq: [
			{
				q: 'Is this DNS lookup free?',
				a: 'Yes, completely free with no signup. digga is open source under AGPL 3.0.',
			},
			{
				q: 'Which DNS record types are supported?',
				a: 'A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, PTR, NAPTR, CAA, DNSKEY, and DS. Records are grouped by type so the report is easy to read.',
			},
			{
				q: 'Can I choose which DNS resolver answers?',
				a: 'Yes. You can switch live between Cloudflare 1.1.1.1, Google 8.8.8.8, and Alibaba DNS over HTTPS, which makes it easy to compare answers and catch propagation gaps.',
			},
			{
				q: 'How do I check whether a domain uses DNSSEC?',
				a: 'Look for DNSKEY and DS records in the report. When the zone is signed they appear automatically, and the overview confirms whether the parent delegation is signed.',
			},
			{
				q: 'Why are my DNS changes not showing up yet?',
				a: 'Resolvers cache records for the length of their TTL. Hover a record to see its TTL in seconds, then switch resolvers to see which ones have already refreshed.',
			},
			{
				q: 'Can I look up DNS records for a subdomain?',
				a: 'Yes. Enter any subdomain such as mail.example.com directly and digga resolves its records the same way it does for an apex domain.',
			},
		],
		related: ['whois', 'email', 'tls'],
	},

	whois: {
		slug: 'whois',
		lookupSegment: 'whois',
		iconKey: 'whois',
		eyebrow: 'Registration',
		name: 'WHOIS Lookup',
		h1: 'Free WHOIS Lookup',
		title: 'WHOIS Lookup · Registrar, Owner & Expiry Date',
		description:
			'Free WHOIS lookup for any domain. Find the registrar, nameservers, domain status, and creation and expiry dates. RDAP first, raw WHOIS fallback.',
		keywords: [
			'whois lookup',
			'whois domain',
			'domain whois',
			'whois checker',
			'domain registration lookup',
			'registrar lookup',
			'domain expiry check',
			'domain owner lookup',
		],
		heroSubtitle:
			'Run a WHOIS lookup for any domain. Find the registrar, registration and expiry dates, nameservers, domain status, and DNSSEC. digga queries RDAP first and falls back to raw WHOIS.',
		bullets: [
			{
				title: 'Registrar and IANA ID',
				body: 'See who the domain is registered through, with the registrar IANA ID and an abuse contact when the registry publishes one.',
			},
			{
				title: 'Key dates',
				body: 'Creation, last update, and expiration dates so you can tell how old a domain is and when it renews.',
			},
			{
				title: 'Status codes explained',
				body: 'EPP status flags like clientTransferProhibited are decoded into plain language instead of cryptic strings.',
			},
			{
				title: 'Nameservers and DNSSEC',
				body: 'The authoritative nameservers on record plus whether the registry reports a signed DNSSEC delegation.',
			},
		],
		sections: [
			{
				heading: 'What is a WHOIS lookup?',
				body: 'A WHOIS lookup queries the registry and registrar records behind a domain to reveal who registered it, through which registrar, when it was created, and when it expires. It is the first stop for verifying ownership, checking a renewal date, investigating abuse, or researching a domain before you buy it. digga presents the data as a clean, structured record rather than a wall of raw text.',
			},
			{
				heading: 'What information does WHOIS show?',
				body: 'A typical record includes the registrar and its IANA ID, the registrant organization where it is not redacted, the creation, update, and expiration dates, the domain status codes, the authoritative nameservers, and the DNSSEC state. For many generic TLDs the registrant contact is redacted for privacy, so the registrar and dates are usually the most reliable fields.',
			},
			{
				heading: 'RDAP first, WHOIS fallback',
				body: 'digga queries RDAP first because it returns clean, structured JSON that maps directly into the record you see. When a registry has not rolled out RDAP yet, digga falls back to the classic WHOIS protocol and parses the plain text response. You get the best available data either way, with a toggle to view the raw response.',
			},
			{
				heading: 'Why is some WHOIS data redacted?',
				body: 'Since GDPR, most registrars redact personal registrant details from public WHOIS and RDAP. That is expected and not an error. A few registries, such as SWITCH for .ch and .li, also block automated lookups entirely. In those cases digga shows what is available and links you to a manual lookup at the registry or ICANN.',
			},
		],
		faq: [
			{
				q: 'Is this WHOIS lookup free?',
				a: 'Yes, completely free with no signup. digga is open source under AGPL 3.0.',
			},
			{
				q: 'What is WHOIS?',
				a: 'WHOIS is the original domain registration lookup protocol from 1982. It returns the registrar, registration dates, nameservers, and status for a domain in plain text on port 43.',
			},
			{
				q: 'Why is the registrant name hidden or redacted?',
				a: 'Most registrars redact personal registrant details to comply with GDPR. The registrar, dates, status, and nameservers usually remain visible.',
			},
			{
				q: 'What is the difference between WHOIS and RDAP?',
				a: 'RDAP is the modern JSON based replacement for WHOIS. It returns structured fields that map cleanly into a UI, while WHOIS returns free form text. digga uses RDAP first and falls back to WHOIS.',
			},
			{
				q: 'Can I see when a domain expires?',
				a: 'Yes, when the registry publishes it. The record shows the creation, last update, and expiration dates.',
			},
			{
				q: 'Why does WHOIS return nothing for some domains?',
				a: 'Some registries are RDAP only, and a few such as SWITCH for .ch and .li block automated queries. digga shows what is available and links you to a manual lookup.',
			},
		],
		related: ['rdap', 'dns', 'subdomains'],
	},

	rdap: {
		slug: 'rdap',
		lookupSegment: 'whois',
		iconKey: 'rdap',
		eyebrow: 'Registration',
		name: 'RDAP Lookup',
		h1: 'Free RDAP Lookup',
		title: 'RDAP Lookup · Structured Domain Registration Data',
		description:
			'Free RDAP lookup for any domain. Structured registrar, status, event, and DNSSEC data from the Registration Data Access Protocol, the modern WHOIS.',
		keywords: [
			'rdap lookup',
			'rdap client',
			'rdap query',
			'registration data access protocol',
			'rdap vs whois',
			'structured whois',
			'rdap json',
		],
		heroSubtitle:
			'Run an RDAP lookup for any domain. The Registration Data Access Protocol returns structured JSON for registrar, status, events, entities, and DNSSEC. The modern replacement for WHOIS.',
		bullets: [
			{
				title: 'Structured fields',
				body: 'Registrar, entities, events, and status arrive as typed JSON, not free form text, so every value lands in the right place.',
			},
			{
				title: 'Standardized status',
				body: 'RDAP uses a fixed vocabulary of status and event types, which digga decodes into plain language.',
			},
			{
				title: 'IANA bootstrap discovery',
				body: 'digga finds the correct RDAP server for each TLD through the official IANA bootstrap registry.',
			},
			{
				title: 'Raw JSON toggle',
				body: 'Read the clean record or flip to the raw RDAP response to inspect every field the registry returned.',
			},
		],
		sections: [
			{
				heading: 'What is RDAP?',
				body: 'The Registration Data Access Protocol is the modern, JSON based successor to WHOIS, defined in RFC 7480 and related standards. Every registry runs an RDAP server, discoverable through the IANA bootstrap registry, that returns registration data as structured objects. Because the response is typed JSON rather than free form text, an RDAP lookup is far more reliable to parse and display than classic WHOIS.',
			},
			{
				heading: 'RDAP vs WHOIS',
				body: 'WHOIS returns plain text that varies from registrar to registrar, which makes it fragile to read consistently. RDAP returns the same information as standardized JSON with defined field names, status values, and event types. It also supports secure transport and internationalization. RDAP is gradually replacing WHOIS across the registry world, so digga queries it first and only falls back to WHOIS when a registry has not adopted it yet.',
			},
			{
				heading: 'How RDAP discovery works',
				body: 'There is no single RDAP server for every domain. Each TLD operator runs its own. digga looks up the right server in the IANA bootstrap registry, then queries it directly for the domain you entered. That is the same mechanism RDAP clients and the registry ecosystem rely on, so the data you see comes straight from the authoritative source.',
			},
			{
				heading: 'What you get back',
				body: 'A normalized record with the registrar and its IANA ID, registration and expiration events, domain status codes, nameservers, and DNSSEC state. Where the registry redacts contact details for privacy, digga shows what remains and lets you open the raw RDAP JSON to see the complete response.',
			},
		],
		faq: [
			{
				q: 'Is this RDAP lookup free?',
				a: 'Yes, completely free with no signup. digga is open source under AGPL 3.0.',
			},
			{
				q: 'What is RDAP?',
				a: 'RDAP, the Registration Data Access Protocol, is the modern JSON based replacement for WHOIS defined in RFC 7480. It returns structured registration data from the registry RDAP server for each TLD.',
			},
			{
				q: 'Is RDAP replacing WHOIS?',
				a: 'Yes, gradually. RDAP returns standardized, machine readable JSON and is being rolled out across registries. digga queries RDAP first and falls back to WHOIS where RDAP is not yet available.',
			},
			{
				q: 'Which TLDs support RDAP?',
				a: 'Most generic TLDs and a growing number of country code TLDs run an RDAP server, discoverable through the IANA bootstrap registry. digga finds the right server automatically.',
			},
			{
				q: 'Can I see the raw RDAP response?',
				a: 'Yes. The record view shows the clean, structured fields, and a toggle reveals the raw RDAP JSON exactly as the registry returned it.',
			},
		],
		related: ['whois', 'dns', 'email'],
	},

	subdomains: {
		slug: 'subdomains',
		lookupSegment: 'subdomains',
		iconKey: 'subdomains',
		eyebrow: 'Discovery',
		name: 'Subdomain Finder',
		h1: 'Free Subdomain Finder',
		title: 'Subdomain Finder · Discover Subdomains of a Domain',
		description:
			'Free subdomain finder. Discover subdomains passively from Certificate Transparency logs and public sources, with no traffic sent to the target.',
		keywords: [
			'subdomain finder',
			'subdomain lookup',
			'subdomain enumeration',
			'find subdomains',
			'subdomain scanner',
			'certificate transparency subdomains',
			'passive subdomain discovery',
		],
		heroSubtitle:
			'Find the subdomains of any domain. digga enumerates them passively from Certificate Transparency logs and other public sources, so no traffic ever reaches the target.',
		bullets: [
			{
				title: 'Passive only',
				body: 'Subdomains come from public records like Certificate Transparency logs. digga never sends a single request to the target domain.',
			},
			{
				title: 'Many sources merged',
				body: 'Results from several public sources are combined and deduplicated into one clean, sorted list.',
			},
			{
				title: 'Streamed results',
				body: 'Names stream back to your browser as they are discovered, so you see findings appear instead of waiting on a spinner.',
			},
			{
				title: 'Click through to records',
				body: 'Open any discovered subdomain to inspect its own DNS, registration, and certificate data.',
			},
		],
		sections: [
			{
				heading: 'What is a subdomain finder?',
				body: 'A subdomain finder discovers the hostnames that sit under a domain, such as mail.example.com, api.example.com, or staging.example.com. Security teams use it to map attack surface, engineers use it to take inventory of deployed services, and researchers use it to understand how an organization is structured. digga finds subdomains passively, which means it collects them from public records rather than probing the target.',
			},
			{
				heading: 'How passive enumeration works',
				body: 'Every time a TLS certificate is issued, the hostname is logged in public Certificate Transparency logs. Those logs, together with other public datasets, reveal subdomains that have ever been given a certificate or otherwise published. digga queries these sources, merges the results, and removes duplicates. Because the data already exists publicly, nothing is ever sent to the domain you are researching.',
			},
			{
				heading: 'Why map subdomains?',
				body: 'Forgotten staging servers, legacy apps, and misconfigured services are a common way in for attackers. Listing the subdomains attached to a domain is the fastest way to see the full footprint, triage which hosts to harden, and confirm that a deploy or a decommission did what you expected. It is equally useful for due diligence and competitive research.',
			},
			{
				heading: 'Is passive discovery safe and legal?',
				body: 'Passive enumeration only reads public records, so it does not touch the target and does not generate traffic that could be mistaken for an attack. That makes it a safe first step for asset inventory and authorized security work. It also means the list reflects what is publicly observable, not necessarily every subdomain that exists.',
			},
		],
		faq: [
			{
				q: 'Is this subdomain finder free?',
				a: 'Yes, completely free with no signup. digga is open source under AGPL 3.0.',
			},
			{
				q: 'How does subdomain discovery work?',
				a: 'digga gathers subdomains from public sources such as Certificate Transparency logs, then merges and deduplicates them. It is fully passive.',
			},
			{
				q: 'Does it send traffic to my domain?',
				a: 'No. Discovery is passive and reads only public records, so nothing is ever sent to the target domain itself.',
			},
			{
				q: 'Will it find every subdomain?',
				a: 'Not necessarily. Passive sources reveal names that have been logged publicly, for example through issued certificates. Subdomains that were never published may not appear.',
			},
			{
				q: 'Can I use this for security research?',
				a: 'Yes. Passive subdomain enumeration is a standard, low risk step for asset inventory and authorized attack surface mapping.',
			},
		],
		related: ['dns', 'tls', 'whois'],
	},

	email: {
		slug: 'email',
		lookupSegment: 'email',
		iconKey: 'email',
		eyebrow: 'Email',
		name: 'Email Security Check',
		h1: 'Free Email Security Check',
		title: 'Email Security Check · SPF, DKIM, DMARC, BIMI',
		description:
			'Free email security check. Analyze SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and BIMI for any domain, with the SPF lookup limit validated for you.',
		keywords: [
			'email security check',
			'spf lookup',
			'spf checker',
			'dkim lookup',
			'dmarc lookup',
			'dmarc checker',
			'email spoofing check',
			'mta-sts',
			'tls-rpt',
			'bimi check',
		],
		heroSubtitle:
			'Check a domain email security in one view. digga analyzes SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and BIMI and shows how well the domain resists spoofing.',
		bullets: [
			{
				title: 'SPF with limit check',
				body: 'The SPF record is parsed and validated against the ten DNS lookup limit, a common reason SPF silently breaks.',
			},
			{
				title: 'DMARC policy and enforcement',
				body: 'See whether DMARC is set to none, quarantine, or reject, and whether it is actually enforcing or only monitoring.',
			},
			{
				title: 'DKIM, MTA-STS, and more',
				body: 'DKIM selectors, MTA-STS, TLS-RPT, and BIMI are all surfaced so you can see the full posture in one place.',
			},
			{
				title: 'A plain verdict',
				body: 'digga turns the records into a clear read on how well the domain resists spoofing, and flags common misconfigurations.',
			},
		],
		sections: [
			{
				heading: 'What is an email security check?',
				body: 'An email security check reads the DNS based policies that decide whether a message claiming to come from a domain is genuine. SPF, DKIM, and DMARC together stop attackers from spoofing a domain to send phishing or fraud. digga inspects all of them, plus MTA-STS, TLS-RPT, and BIMI, and turns the result into a clear picture of how well the domain is protected.',
			},
			{
				heading: 'SPF, DKIM, and DMARC explained',
				body: 'SPF lists the servers allowed to send mail for a domain. DKIM signs each message with a cryptographic key so receivers can verify it was not altered. DMARC ties the two together, tells receivers whether to quarantine or reject mail that fails, and enables reporting. A domain needs all three configured correctly to meaningfully resist spoofing. digga checks each one and explains what is missing.',
			},
			{
				heading: 'MTA-STS, TLS-RPT, and BIMI',
				body: 'MTA-STS tells sending servers to require encrypted, authenticated delivery, closing a downgrade attack on email in transit. TLS-RPT collects reports about delivery failures so you can spot problems. BIMI lets a domain display its logo in supporting inboxes once DMARC is enforcing. These records round out a strong email setup, and digga reports on each.',
			},
			{
				heading: 'Why email authentication matters',
				body: 'Email spoofing is one of the most common vectors for phishing, invoice fraud, and brand abuse. A domain with weak or missing SPF, DKIM, and DMARC can be impersonated by anyone. Getting these records right protects your recipients, improves deliverability to the inbox, and is increasingly required by major mailbox providers.',
			},
		],
		faq: [
			{
				q: 'Is this email security check free?',
				a: 'Yes, completely free with no signup. digga is open source under AGPL 3.0.',
			},
			{
				q: 'What does the email check analyze?',
				a: 'SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and BIMI for any domain, with the SPF record validated against the ten DNS lookup limit.',
			},
			{
				q: 'What does a strong SPF and DMARC setup look like?',
				a: 'A valid SPF record within the ten lookup limit, DKIM signing in place, and a DMARC policy set to quarantine or reject rather than none, so failing mail is actually rejected.',
			},
			{
				q: 'What is the SPF ten lookup limit?',
				a: 'SPF allows at most ten DNS lookups while evaluating a record. Exceed it and SPF fails with a permerror, so digga checks your record against the limit.',
			},
			{
				q: 'Does a passing check mean my domain cannot be spoofed?',
				a: 'It means the published policies are strong, which is most of the battle. Real protection also depends on DMARC being enforced and on the receiving server honoring these records.',
			},
			{
				q: 'Can I check SPF and DMARC for a subdomain?',
				a: 'Yes. Enter a subdomain and digga evaluates the records that apply to it.',
			},
		],
		related: ['dns', 'whois', 'tls'],
	},

	tls: {
		slug: 'tls',
		lookupSegment: 'tls',
		iconKey: 'tls',
		eyebrow: 'Certificates',
		name: 'SSL and TLS Certificate Checker',
		h1: 'Free SSL and TLS Certificate Checker',
		title: 'SSL and TLS Certificate Checker · Issuer & Expiry',
		description:
			'Free SSL and TLS certificate checker. Inspect the issuer, expiry countdown, protocol, cipher, subject alternative names, and chain for any domain.',
		keywords: [
			'ssl checker',
			'tls checker',
			'ssl certificate checker',
			'tls certificate lookup',
			'certificate expiry checker',
			'ssl expiration check',
			'certificate chain checker',
		],
		heroSubtitle:
			'Check the SSL and TLS certificate of any domain. See the issuer, validity window, expiry countdown, protocol version, cipher, subject alternative names, and the full chain.',
		bullets: [
			{
				title: 'Issuer and subject',
				body: 'See who issued the certificate and which name it was issued for, straight from the live handshake.',
			},
			{
				title: 'Validity and expiry',
				body: 'The valid from and valid to dates plus a countdown to expiry, so a certificate never lapses on you unnoticed.',
			},
			{
				title: 'Protocol and cipher',
				body: 'The negotiated TLS version and cipher suite, so you can confirm the connection uses modern, strong cryptography.',
			},
			{
				title: 'SANs and chain',
				body: 'Every subject alternative name the certificate covers and the chain up to the issuing authority.',
			},
		],
		sections: [
			{
				heading: 'What is an SSL and TLS certificate check?',
				body: 'An SSL and TLS certificate check connects to a domain and inspects the certificate it presents during the handshake. It tells you who issued the certificate, which names it covers, how long it is valid, and which protocol and cipher the server negotiated. digga performs the handshake live, so you see the certificate the server is actually serving right now, not a cached copy.',
			},
			{
				heading: 'What the certificate tells you',
				body: 'The issuer reveals which certificate authority signed it, the subject and subject alternative names show every hostname it is valid for, and the validity window shows when it starts and stops being trusted. The chain links the certificate to a trusted root. Together these fields tell you whether visitors will see a secure connection or a warning.',
			},
			{
				heading: 'When does my certificate expire?',
				body: 'Expired certificates are one of the most common and most avoidable causes of outages and browser warnings. digga shows the exact valid to date and a countdown, so you can renew well ahead of time. Pair it with the DNS and email tools to confirm the whole domain stays healthy.',
			},
			{
				heading: 'TLS versions and ciphers',
				body: 'Modern sites should negotiate TLS 1.2 or TLS 1.3 with a strong cipher suite. Seeing the negotiated protocol and cipher lets you confirm a server is not falling back to outdated, weak cryptography, which matters for both security and compliance.',
			},
		],
		faq: [
			{
				q: 'Is this SSL and TLS checker free?',
				a: 'Yes, completely free with no signup. digga is open source under AGPL 3.0.',
			},
			{
				q: 'What is the difference between SSL and TLS?',
				a: 'TLS is the modern protocol that replaced SSL. The term SSL is still used loosely, but every current certificate secures connections over TLS.',
			},
			{
				q: 'How do I check when a certificate expires?',
				a: 'The report shows the valid from and valid to dates along with a countdown to expiry, so you can renew before it lapses.',
			},
			{
				q: 'What are subject alternative names?',
				a: 'Subject alternative names, or SANs, are the full list of hostnames a single certificate is valid for, including any additional domains and subdomains it covers.',
			},
			{
				q: 'Why might the certificate differ from what my browser shows?',
				a: 'A server can present different certificates depending on the hostname requested through SNI. digga checks the certificate served for the exact name you enter.',
			},
		],
		related: ['dns', 'subdomains', 'email'],
	},
};

export const TOOL_LIST: Tool[] = Object.values(TOOLS);

export function isToolSlug(value: string): value is ToolSlug {
	return value in TOOLS;
}
