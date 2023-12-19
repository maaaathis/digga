import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import type { FC, ReactElement, ReactNode } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';
import Providers from './providers';

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL
    ? new URL(process.env.SITE_URL)
    : new URL('http://localhost:300'),
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
    'digga is the easy but incredibly powerful tool for full domain and infrastructure research.',
  keywords: [
    'digga',
    'dig',
    'domain',
    'domain dig',
    'dns',
    'ssl certs',
    'dns dig',
  ],
  openGraph: {
    type: 'website',
    title: 'digga · Infrastructure research',
    description:
      'Effortlessly gather and analyze DNS records, WHOIS data, SSL/TLS certificate history, and more with digga – a powerful tool that requires no installation for swift access and insights into domain-related information.',
    url: '/',
  },
  alternates: {
    canonical: '/',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }): ReactElement => {
  return (
    <html lang="en" suppressHydrationWarning className={rubik.className}>
      <body>
        <Providers>
          <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
            <div className="absolute bottom-0 left-0 right-0 top-0 max-h-screen bg-[linear-gradient(to_right,#8c8c8c2e_1px,transparent_1px),linear-gradient(to_bottom,#8c8c8c2e_1px,transparent_1px)] bg-[size:24px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]" />
            <main className="z-10 w-full flex-1">
              <Header />
              {children}
              <Footer />
            </main>
          </div>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
