'use client';

import { ThemeProvider } from 'next-themes';
import type { FC, ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

type ProvidersProps = { children: ReactNode };

const swrFetcher = async (input: RequestInfo | URL) => {
	const response = await fetch(input, { headers: { Accept: 'application/json' } });
	if (!response.ok) {
		const error = new Error('Request failed');
		(error as Error & { status: number }).status = response.status;
		throw error;
	}
	return response.json();
};

const Providers: FC<ProvidersProps> = ({ children }) => (
	<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
		<SWRConfig
			value={{
				fetcher: swrFetcher,
				revalidateOnFocus: false,
				revalidateOnReconnect: true,
				dedupingInterval: 30_000,
			}}
		>
			<TooltipProvider delayDuration={200}>{children}</TooltipProvider>
			<Toaster richColors closeButton position="top-right" />
		</SWRConfig>
	</ThemeProvider>
);

export default Providers;
