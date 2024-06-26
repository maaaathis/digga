'use client';

import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from 'next-themes';
import type { FC, ReactElement, ReactNode } from 'react';
import { SWRConfig } from 'swr';

type ProvidersProps = {
  children: ReactNode;
};

const DiggaPlausibleProvider: FC<ProvidersProps> = ({ children }) => {
  if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
    return children;
  }

  return (
    <PlausibleProvider
      customDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_HOST}
      trackOutboundLinks
      domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
    >
      {children}
    </PlausibleProvider>
  );
};

const Providers: FC<ProvidersProps> = ({ children }): ReactElement => (
  <ThemeProvider attribute="class">
    <SWRConfig
      value={{ fetcher: (url) => fetch(url).then((res) => res.json()) }}
    >
      <DiggaPlausibleProvider>{children}</DiggaPlausibleProvider>
    </SWRConfig>
  </ThemeProvider>
);

export default Providers;
