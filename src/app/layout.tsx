import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';

import Analytics from '@/components/analytics';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/data';
import { siteUrl } from '@/lib/seo';
import { cn } from '@/lib/utils';

import './globals.css';
import Providers from './providers';

const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	variable: '--font-heading',
	display: 'swap',
});

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap',
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
});

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl()),
	title: {
		default: `${SITE_NAME} · ${SITE_TAGLINE}`,
		template: `%s · ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: [...SEO_KEYWORDS],
	openGraph: {
		type: 'website',
		siteName: SITE_NAME,
		title: `${SITE_NAME} · ${SITE_TAGLINE}`,
		description: SITE_DESCRIPTION,
		url: '/',
	},
	twitter: {
		card: 'summary_large_image',
		title: `${SITE_NAME} · ${SITE_TAGLINE}`,
		description: SITE_DESCRIPTION,
	},
	alternates: { canonical: '/' },
	robots: 'index, follow',
	icons: {
		icon: '/favicon-32x32.png',
		apple: '/apple-touch-icon.png',
		other: [
			{ url: '/android-chrome-192x192.png', rel: 'icon', sizes: '192x192' },
			{ url: '/android-chrome-256x256.png', rel: 'icon', sizes: '256x256' },
		],
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
	],
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				'h-full antialiased',
				geistSans.variable,
				geistMono.variable,
				spaceGrotesk.variable,
			)}
		>
			<body className="bg-background text-foreground flex min-h-full flex-col font-sans">
				<Providers>
					<div className="surface-blur relative flex min-h-screen flex-col">
						<Header />
						<main className="relative z-10 flex-1">{children}</main>
						<Footer />
					</div>
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}
