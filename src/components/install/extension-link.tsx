import Link from 'next/link';
import type { FC } from 'react';

import { EXTENSION_TARGETS } from '@/components/install/extension-targets';
import type { BrowserTarget } from '@/lib/browser';

type ExtensionLinkProps = { browser: BrowserTarget };

const ExtensionLink: FC<ExtensionLinkProps> = ({ browser }) => {
	const { url, action, Icon } = EXTENSION_TARGETS[browser];

	return (
		<div className="flex justify-center">
			<Link
				href={url}
				target="_blank"
				rel="noreferrer noopener"
				data-umami-event="install-extension"
				data-umami-event-source="home"
				data-umami-event-browser={browser}
				className="ring-border/60 hover:ring-foreground/40 bg-background text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5"
			>
				<Icon className="size-4" />
				{action}
			</Link>
		</div>
	);
};

export default ExtensionLink;
