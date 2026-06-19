import type { FC } from 'react';

import { SITE_NAME } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
	title: 'Privacy Policy · digga Domain Lookup',
	description: 'Privacy policy for the digga Domain Lookup browser extension.',
	path: '/extension/privacy',
	noIndex: true,
});

const Page: FC = () => (
	<div className="mx-auto w-full max-w-2xl px-5 py-16 sm:py-24">
		<h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
			Privacy Policy for {SITE_NAME} Domain Lookup
		</h1>
		<p className="text-muted-foreground mt-3 text-sm">Last updated: June 19, 2026</p>

		<div className="text-muted-foreground mt-8 space-y-5 text-base leading-relaxed">
			<p>
				{SITE_NAME} Domain Lookup does not collect, store, sell, or share personal
				information.
			</p>
			<p>
				The extension does not monitor browsing activity, read page content, or maintain
				browsing history.
			</p>
			<p>
				When the user explicitly activates the extension through the browser menu or toolbar
				icon, the extension extracts the relevant hostname and opens the corresponding public
				page on digga.dev.
			</p>
			<p>No extension analytics or advertising trackers are included.</p>
			<p>Questions can be directed to the contact address published on digga.dev.</p>
		</div>
	</div>
);

export default Page;
