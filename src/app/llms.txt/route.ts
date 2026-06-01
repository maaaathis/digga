import { SITE_DESCRIPTION } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET(): Response {
	const body = `# digga.dev

> ${SITE_DESCRIPTION}

digga is a free, open source domain and infrastructure research tool. Enter any domain, subdomain, or URL to inspect its DNS, registration, and subdomains. No signup, no paywall.

## What it does

- DNS records: A, AAAA, MX, NS, TXT, CAA, DNSKEY, DS, SOA, SRV, PTR, NAPTR, CNAME. Resolved live via Cloudflare, Google, or Alibaba DNS over HTTPS.
- RDAP: structured registration data (registrar, registrant, status, events, DNSSEC) queried through the IANA bootstrap registry.
- WHOIS: raw registration data as a fallback when a registry does not support RDAP.
- Subdomains: passive enumeration from public sources like Certificate Transparency logs. No traffic is sent to the target.
- IP intelligence: ASN, organization, country, and reverse DNS for every A and AAAA record.
- Email security: SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and BIMI checks with spoofing-protection analysis.

## Key pages

- [Home](${absoluteUrl('/')}): search entry point and overview of features.
- [Lookup overview](${absoluteUrl('/lookup/{domain}')}): registration, key dates, nameservers, status, DNS summary for a domain.
- [DNS records](${absoluteUrl('/lookup/{domain}/dns')}): every DNS record type with a resolver switch.
- [RDAP and WHOIS](${absoluteUrl('/lookup/{domain}/whois')}): registration data, RDAP first with WHOIS fallback.
- [Subdomains](${absoluteUrl('/lookup/{domain}/subdomains')}): passive subdomain discovery.
- [Email security](${absoluteUrl('/lookup/{domain}/email')}): SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and BIMI posture.
- [TLS certificate](${absoluteUrl('/lookup/{domain}/tls')}): live certificate issuer, validity window, expiry countdown, protocol, cipher, SANs, and chain.

Replace {domain} with any domain name, for example ${absoluteUrl('/lookup/example.com')}.

## Facts

- License: AGPL 3.0, open source.
- Price: free for everyone.
- Source: https://github.com/maaaathis/digga
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400',
		},
	});
}
