import { Activity, Database, Globe2, Layers, MailCheck, ScrollText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import ChromeIcon from '@/components/brand/chrome-icon';
import LogoMark from '@/components/brand/logo';
import BookmarkletLink from '@/components/install/bookmarklet-link';
import ExtensionLink from '@/components/install/extension-link';
import IOSShortcutLink from '@/components/install/ios-shortcut-link';
import SearchForm from '@/components/search/search-form';
import ToolIcon from '@/components/tool/tool-icon';
import { CHROME_EXTENSION_URL, EXAMPLE_DOMAINS, SITE_DESCRIPTION, SITE_NAME } from '@/lib/data';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { TOOL_LIST } from '@/lib/tools';

export const metadata: Metadata = buildMetadata({
	title: 'digga · Domain & Infrastructure research',
	description: SITE_DESCRIPTION,
	path: '/',
});

type Feature = {
	number: string;
	icon: ReactNode;
	title: string;
	body: string;
};

const FEATURES: Feature[] = [
	{
		number: '01',
		icon: <Globe2 className="size-4" />,
		title: 'DNS, every type',
		body: 'A, AAAA, MX, NS, TXT, CAA, DNSKEY, DS, SOA, SRV, PTR, NAPTR, CNAME. Switch live between Cloudflare, Google, and Alibaba DoH.',
	},
	{
		number: '02',
		icon: <ScrollText className="size-4" />,
		title: 'RDAP first, WHOIS fallback',
		body: 'Structured registration data through RDAP, with raw WHOIS as a graceful fallback when the registry has not caught up.',
	},
	{
		number: '03',
		icon: <Layers className="size-4" />,
		title: 'Subdomain discovery',
		body: 'Passive enumeration from public sources. Triggered on demand, results streamed back to your browser as they land.',
	},
	{
		number: '04',
		icon: <Database className="size-4" />,
		title: 'IP, ASN, owner',
		body: 'Every A and AAAA record annotated with the responsible network. Click through for the full geolocation picture.',
	},
	{
		number: '05',
		icon: <MailCheck className="size-4" />,
		title: 'Email authentication',
		body: 'SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and BIMI in one view. See how well a domain resists spoofing, with the SPF lookup limit checked for you.',
	},
	{
		number: '06',
		icon: <Activity className="size-4" />,
		title: 'Free, always',
		body: 'Open source under AGPL 3.0. No accounts, no paywalls, no creepy tracking. Just type and dig.',
	},
];

type Concept = {
	term: string;
	definition: string;
	link: { label: string; href: string };
};

const CONCEPTS: Concept[] = [
	{
		term: 'DNS records',
		definition:
			'DNS records map a domain to the infrastructure that serves it. The A record points to an IPv4 address, AAAA points to IPv6, MX to mail servers, NS to the authoritative name servers, TXT carries verification and policy strings like SPF and DMARC, and CAA controls which certificate authorities may issue a certificate for the domain.',
		link: {
			label: 'RFC 1035',
			href: 'https://www.rfc-editor.org/rfc/rfc1035',
		},
	},
	{
		term: 'RDAP',
		definition:
			'The Registration Data Access Protocol is the modern, JSON based replacement for WHOIS. Every registry runs an RDAP server discoverable through the IANA bootstrap registry. digga queries RDAP first because it returns structured fields for registrar, registrant, status, events, and DNSSEC.',
		link: {
			label: 'RFC 7480',
			href: 'https://www.rfc-editor.org/rfc/rfc7480',
		},
	},
	{
		term: 'WHOIS',
		definition:
			'The original registration lookup protocol from 1982. Plain text, free form, port 43. Some TLDs still only speak WHOIS, so digga keeps a WHOIS fallback that runs whoiser against the right whois.iana.org referral chain.',
		link: {
			label: 'RFC 3912',
			href: 'https://www.rfc-editor.org/rfc/rfc3912',
		},
	},
	{
		term: 'Subdomain enumeration',
		definition:
			'Discovering the subdomains attached to a domain. Useful for asset inventory, attack surface mapping, and triaging deploys. digga uses passive sources like Certificate Transparency logs, never touching the target directly.',
		link: {
			label: 'Certificate Transparency',
			href: 'https://certificate.transparency.dev/',
		},
	},
	{
		term: 'Email authentication (SPF, DKIM, DMARC)',
		definition:
			'Three DNS based standards that stop attackers from spoofing a domain. SPF lists the servers allowed to send mail, DKIM signs each message with a cryptographic key, and DMARC ties the two together and tells receivers whether to quarantine or reject mail that fails. digga checks all three, plus MTA-STS, TLS-RPT, and BIMI, and validates the SPF ten lookup limit.',
		link: {
			label: 'RFC 7489',
			href: 'https://www.rfc-editor.org/rfc/rfc7489',
		},
	},
];

const STEPS = [
	{
		title: 'Type a domain',
		body: 'Apex, subdomain, or full URL. digga normalizes the input, handles IDN punycode, and routes you to the right results page.',
	},
	{
		title: 'Read the overview',
		body: 'Registration data, important dates, nameservers, status flags, DNSSEC, and the most relevant DNS records. Everything in one glance.',
	},
	{
		title: 'Drill into specifics',
		body: 'DNS tab for every record type with a resolver switch. WHOIS tab for RDAP JSON and raw WHOIS. Subdomains tab to kick off a passive scan. Email tab for SPF, DKIM, and DMARC.',
	},
];

const FAQ = [
	{
		q: 'Is digga free?',
		a: 'Yes, completely free for everyone — no signup, no accounts, no paywalls. digga is open source under AGPL 3.0.',
	},
	{
		q: 'What is the difference between RDAP and WHOIS?',
		a: 'RDAP is the modern JSON based registration protocol defined in RFC 7480 and friends. WHOIS, defined in RFC 3912, is the original plain text protocol from 1982. RDAP returns structured fields that map cleanly into a UI; WHOIS returns free form text that varies per registrar. digga uses RDAP first and falls back to WHOIS when a registry has not yet rolled out RDAP.',
	},
	{
		q: 'Which DNS resolvers can I use?',
		a: 'digga ships three public DoH resolvers: Cloudflare 1.1.1.1, Google 8.8.8.8, and Alibaba DNS. You can switch between them live without reloading the page; DNS responses come straight from the resolver to your browser, never through our servers.',
	},
	{
		q: 'How does subdomain discovery work?',
		a: 'When you click Run scan, our server gathers subdomains from passive public sources like Certificate Transparency logs. It is purely passive: no traffic is ever sent to the target domain itself.',
	},
	{
		q: 'Can digga check SPF, DKIM, and DMARC?',
		a: 'Yes. The Email tab analyzes SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and BIMI for any domain. It validates the SPF record against the ten DNS lookup limit, reports whether DMARC is enforcing, and flags common misconfigurations that leave a domain open to email spoofing.',
	},
	{
		q: 'Can I look up subdomains and IP records too?',
		a: 'Yes. Enter any subdomain like mail.example.com directly. digga also lets you click into individual IPs from the A and AAAA records to see ASN, organization, and country information.',
	},
	{
		q: 'Does digga support DNSSEC?',
		a: 'Yes. The overview page reports whether the parent zone has a signed DS delegation, and the DNS tab surfaces DNSKEY and DS records when the resolver returns them.',
	},
	{
		q: 'Why might WHOIS data be missing?',
		a: 'A few TLDs, notably .ch and .li under SWITCH, block automated WHOIS. Some registries are RDAP only. And some registrars redact registrant information per GDPR. In all three cases digga shows what is available and links to ICANN for a direct manual lookup.',
	},
];

const websiteSchema = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	'name': SITE_NAME,
	'description': SITE_DESCRIPTION,
	'url': absoluteUrl('/'),
	'potentialAction': {
		'@type': 'SearchAction',
		'target': `${absoluteUrl('/lookup')}/{search_term_string}`,
		'query-input': 'required name=search_term_string',
	},
};

const softwareSchema = {
	'@context': 'https://schema.org',
	'@type': 'SoftwareApplication',
	'name': SITE_NAME,
	'applicationCategory': 'DeveloperApplication',
	'operatingSystem': 'Any',
	'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
	'url': absoluteUrl('/'),
	'description': SITE_DESCRIPTION,
	'featureList': FEATURES.map(feature => feature.title),
};

const howToSchema = {
	'@context': 'https://schema.org',
	'@type': 'HowTo',
	'name': 'How to research a domain with digga',
	'description':
		'Look up DNS records, registration data, and subdomains for any domain in three steps.',
	'step': STEPS.map((step, index) => ({
		'@type': 'HowToStep',
		'position': index + 1,
		'name': step.title,
		'text': step.body,
	})),
};

const faqSchema = {
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	'mainEntity': FAQ.map(entry => ({
		'@type': 'Question',
		'name': entry.q,
		'acceptedAnswer': { '@type': 'Answer', 'text': entry.a },
	})),
};

const Home: FC = () => (
	<div className="w-full">
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
		/>
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
		/>
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
		/>
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
		/>

		<section className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 pt-10 pb-16 text-center md:pt-14">
			<LogoMark className="text-foreground mb-6 h-16 w-auto md:mb-8 md:h-24" aria-hidden />

			<h1 className="font-display text-foreground text-balance text-4xl leading-[1.07] font-semibold md:text-6xl md:leading-[1.05]">
				Domain research that actually
				<br />
				tells you what is going on.
			</h1>

			<p className="text-muted-foreground text-balance mt-4 max-w-xl text-base md:text-lg">
				DNS, RDAP, WHOIS, subdomains. One search, every angle. Free for everyone.
			</p>

			<div className="mt-8 w-full max-w-2xl">
				<SearchForm size="lg" autofocus />
			</div>

			<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
				<span className="text-muted-foreground text-xs">Try</span>
				{EXAMPLE_DOMAINS.map(domain => (
					<Link
						key={domain}
						href={`/lookup/${domain}`}
						className="bg-muted/60 hover:bg-muted text-foreground rounded-full px-2.5 py-1 font-mono text-xs transition-colors"
					>
						{domain}
					</Link>
				))}
			</div>

			<div className="ring-border/60 bg-card/50 mt-10 flex w-full max-w-2xl items-center gap-3 rounded-2xl p-3 text-left ring-1 sm:gap-4 sm:p-4">
				<span className="ring-border/60 bg-background inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
					<ChromeIcon className="size-6" />
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-foreground text-sm font-medium">New: the digga Chrome extension</p>
					<p className="text-muted-foreground text-sm leading-snug">
						Right click any page to dig its domain. No copy paste, no typing.
					</p>
				</div>
				<Link
					href={CHROME_EXTENSION_URL}
					target="_blank"
					rel="noreferrer noopener"
					data-umami-event="install-extension"
					data-umami-event-source="home-hero"
					className="bg-foreground text-background hover:bg-foreground/90 inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
				>
					<ChromeIcon className="size-4" />
					<span className="hidden sm:inline">Add to Chrome</span>
					<span className="sm:hidden">Add</span>
				</Link>
			</div>
		</section>

		<section id="features" className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16">
			<div className="mb-12 flex items-end justify-between gap-6">
				<div>
					<p className="text-muted-foreground text-xs tracking-wider uppercase">What is inside</p>
					<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
						Six tools, one shortcut.
					</h2>
				</div>
				<p className="text-muted-foreground hidden max-w-sm text-sm sm:block">
					Built for debugging deploys, triaging incidents, and the curious.
				</p>
			</div>

			<ul className="border-border/60 grid grid-cols-1 overflow-hidden rounded-3xl border md:grid-cols-2 lg:grid-cols-3">
				{FEATURES.map(feature => (
					<li
						key={feature.title}
						className="group border-border/60 bg-card/50 hover:bg-card relative flex flex-col gap-4 border-b border-r p-6 transition-colors last:border-b-0 md:[&:nth-child(2n)]:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0"
					>
						<span className="text-muted-foreground/50 absolute top-5 right-5 font-mono text-[11px] tabular-nums">
							{feature.number}
						</span>
						<div className="ring-border/60 bg-background text-foreground inline-flex size-9 items-center justify-center rounded-xl ring-1">
							{feature.icon}
						</div>
						<div>
							<h3 className="text-foreground text-base font-semibold">{feature.title}</h3>
							<p className="text-muted-foreground mt-2 text-sm leading-relaxed">{feature.body}</p>
						</div>
					</li>
				))}
			</ul>
		</section>

		<section id="tools" className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16">
			<div className="mb-10">
				<p className="text-muted-foreground text-xs tracking-wider uppercase">Explore each tool</p>
				<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
					A dedicated page for every lookup.
				</h2>
			</div>

			<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{TOOL_LIST.map(tool => (
					<li key={tool.slug}>
						<Link
							href={`/${tool.slug}`}
							className="group border-border/60 bg-card/50 hover:bg-card flex h-full flex-col gap-3 rounded-2xl border p-6 transition-colors"
						>
							<div className="flex items-center gap-3">
								<span className="ring-border/60 bg-background text-foreground inline-flex size-9 items-center justify-center rounded-xl ring-1">
									<ToolIcon iconKey={tool.iconKey} className="size-4" />
								</span>
								<h3 className="text-foreground text-base font-semibold">{tool.name}</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">{tool.description}</p>
						</Link>
					</li>
				))}
			</ul>
		</section>

		<section id="how" className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16">
			<div className="mb-10">
				<p className="text-muted-foreground text-xs tracking-wider uppercase">How to use digga</p>
				<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
					Three steps to a full picture.
				</h2>
			</div>

			<ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{STEPS.map((step, index) => (
					<li
						key={step.title}
						className="border-border/60 bg-card/50 relative flex flex-col gap-3 rounded-2xl border p-6"
					>
						<span className="text-muted-foreground/60 font-mono text-xs tabular-nums">
							Step {String(index + 1).padStart(2, '0')}
						</span>
						<h3 className="text-foreground text-lg font-semibold">{step.title}</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
					</li>
				))}
			</ol>
		</section>

		<section id="concepts" className="mx-auto w-full max-w-4xl px-5 pt-8 pb-16">
			<div className="mb-10">
				<p className="text-muted-foreground text-xs tracking-wider uppercase">
					What digga looks up
				</p>
				<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
					A quick glossary, no jargon kept secret.
				</h2>
			</div>

			<dl className="space-y-8">
				{CONCEPTS.map(concept => (
					<div
						key={concept.term}
						className="border-border/60 border-b pb-8 last:border-b-0 last:pb-0"
					>
						<dt className="text-foreground text-lg font-semibold">{concept.term}</dt>
						<dd className="text-muted-foreground mt-2 text-base leading-relaxed">
							{concept.definition}{' '}
							<Link
								href={concept.link.href}
								target="_blank"
								rel="noreferrer noopener"
								className="text-foreground underline-offset-4 hover:underline"
							>
								{concept.link.label}
							</Link>
							.
						</dd>
					</div>
				))}
			</dl>
		</section>

		<section id="install" className="mx-auto w-full max-w-4xl px-5 pt-8 pb-16">
			<div className="mb-10">
				<p className="text-muted-foreground text-xs tracking-wider uppercase">One click access</p>
				<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
					Keep digga one tap away.
				</h2>
			</div>

			<div className="border-border/60 bg-card/50 mb-4 flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
				<div className="flex items-start gap-4">
					<span className="ring-border/60 bg-background text-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
						<ChromeIcon className="size-6" />
					</span>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-foreground text-base font-semibold">Chrome extension</h3>
							<span className="bg-foreground text-background rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
								New
							</span>
						</div>
						<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
							Right click any page and jump straight to the digga report for that domain. No copy
							paste, no typing.
						</p>
					</div>
				</div>
				<div className="shrink-0">
					<ExtensionLink />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="border-border/60 bg-card/50 flex flex-col gap-5 rounded-2xl border p-6">
					<div>
						<h3 className="text-foreground text-base font-semibold">Browser bookmarklet</h3>
						<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
							Drag the button below into your bookmark bar. Click it on any site to jump straight to
							the digga results for that domain.
						</p>
					</div>
					<BookmarkletLink />
				</div>

				<div className="border-border/60 bg-card/50 flex flex-col gap-5 rounded-2xl border p-6">
					<div>
						<h3 className="text-foreground text-base font-semibold">iOS shortcut</h3>
						<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
							Add the shortcut to your iPhone or iPad share sheet. Trigger it on any web page to
							research the current domain instantly.
						</p>
					</div>
					<IOSShortcutLink />
				</div>
			</div>
		</section>

		<section id="faq" className="mx-auto w-full max-w-4xl px-5 pt-8 pb-16">
			<div className="mb-10">
				<p className="text-muted-foreground text-xs tracking-wider uppercase">FAQ</p>
				<h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
					Questions, answered.
				</h2>
			</div>

			<div className="border-border/60 divide-border/60 divide-y overflow-hidden rounded-2xl border">
				{FAQ.map((entry, index) => (
					<details
						key={entry.q}
						className="group bg-card/30 open:bg-card transition-colors"
						open={index === 0}
					>
						<summary className="hover:text-foreground text-foreground flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-base font-medium select-none">
							<span>{entry.q}</span>
							<span
								aria-hidden
								className="text-muted-foreground transition-transform group-open:rotate-45"
							>
								+
							</span>
						</summary>
						<div data-nosnippet className="text-muted-foreground px-6 pb-6 text-sm leading-relaxed">
							{entry.a}
						</div>
					</details>
				))}
			</div>
		</section>

		<section className="mx-auto w-full max-w-3xl px-5 pt-8 pb-16 text-center">
			<h2 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
				Ready to dig?
			</h2>
			<p className="text-muted-foreground mt-3">
				Start with one of the example domains or paste your own.
			</p>
			<div className="mt-8">
				<SearchForm size="md" />
			</div>
		</section>
	</div>
);

export default Home;
