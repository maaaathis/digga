import Link from 'next/link';
import type { FC } from 'react';

import ChromeIcon from '@/components/brand/chrome-icon';
import { CHROME_EXTENSION_URL } from '@/lib/data';

const ExtensionLink: FC = () => (
	<div className="flex justify-center">
		<Link
			href={CHROME_EXTENSION_URL}
			target="_blank"
			rel="noreferrer noopener"
			data-umami-event="install-extension"
			data-umami-event-source="home"
			className="ring-border/60 hover:ring-foreground/40 bg-background text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5"
		>
			<ChromeIcon className="size-4" />
			Add to Chrome
		</Link>
	</div>
);

export default ExtensionLink;
