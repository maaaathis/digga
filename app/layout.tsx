import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import localFont from 'next/font/local';
import type { FC, ReactElement, ReactNode } from 'react';

import { Analytics } from '@/components/Analytics';
import Header from '@/components/Header';

import './globals.css';
import Providers from './providers';

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
});

const clash = localFont({
  src: '../public/fonts/ClashDisplay-Variable.woff2',
  display: 'swap',
  variable: '--font-clash',
});

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL
    ? new URL(process.env.SITE_URL)
    : new URL('http://localhost:3000'),
  title: 'digga · Domain- & Infrastructure research',
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
    other: [
      { url: '/android-chrome-192x192.png', rel: 'icon', sizes: '192x192' },
      { url: '/android-chrome-256x256.png', rel: 'icon', sizes: '256x256' },
    ],
  },
  description:
    'digga is your all-in-one dig solution for comprehensive domain and infrastructure research. Effortlessly conduct DNS, Whois & SSL-Certificate lookups by only entering your domain name.',
  keywords: [
    'digga',
    'dig',
    'domain',
    'domain dig',
    'dig domain',
    'dns',
    'ssl certs',
    'dns dig',
    'dns lookup',
    'domain lookup',
    'whois',
    'whois lookup',
    'whois dig',
    'whois search',
    'whois domain',
    'domain research',
    'dig online',
    'domain lookup online',
    'domain certificates',
    'domain ssl',
    'domain ssl certificates',
  ],
  openGraph: {
    type: 'website',
    title: 'digga · Domain & Infrastructure research',
    description:
      'Gather and analyze DNS records, WHOIS data, SSL/TLS certificate history, and more effortlessly with digga – a powerful, no-installation tool for swift access and deep insights into domain-related information.',
    url: '/',
  },
  alternates: {
    canonical: '/',
  },
  robots: 'index, follow',
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }): ReactElement => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rubik.className} ${clash.variable}`}
    >
      <body>
        <Providers>
          <div className="bg-background relative flex min-h-screen flex-col items-center justify-center">
            <div className="absolute top-0 right-0 bottom-0 left-0 max-h-screen bg-[linear-gradient(to_right,#c7c7c72e_1px,transparent_1px),linear-gradient(to_bottom,#c7c7c72e_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:24px_48px] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]" />
            <main className="z-10 w-full flex-1 pb-5">
              <Header />
              {children}
            </main>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
