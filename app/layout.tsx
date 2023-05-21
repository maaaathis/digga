'use client';

import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body>
        <SWRConfig
          value={{ fetcher: (url) => fetch(url).then((res) => res.json()) }}
        >
          <div className="flex min-h-screen flex-col items-center justify-center">
            <Header />

            <div className="w-full flex-1">{children}</div>

            <Footer />
          </div>
        </SWRConfig>
      </body>
    </html>
  );
};

export default RootLayout;
