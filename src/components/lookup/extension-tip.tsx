'use client';

import { Lightbulb, X } from 'lucide-react';
import Link from 'next/link';
import { type FC, useEffect, useState } from 'react';

import { EXTENSION_TARGETS } from '@/components/install/extension-targets';
import { type BrowserTarget, readBrowserTarget } from '@/lib/browser';

const DISMISSED_KEY: Record<BrowserTarget, string> = {
	chrome: 'digga:chromeExtensionTip.dismissed',
	firefox: 'digga:firefoxExtensionTip.dismissed',
};

const ExtensionTip: FC = () => {
	const [browser, setBrowser] = useState<BrowserTarget | null>(null);

	useEffect(() => {
		const target = readBrowserTarget();
		if (localStorage.getItem(DISMISSED_KEY[target]) === '1') return;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setBrowser(target);
	}, []);

	const dismiss = () => {
		if (!browser) return;
		localStorage.setItem(DISMISSED_KEY[browser], '1');
		setBrowser(null);
	};

	if (!browser) return null;

	const { name, action, url, Icon } = EXTENSION_TARGETS[browser];

	return (
		<aside className="ring-foreground/10 bg-card relative mb-8 flex flex-col gap-3 rounded-xl p-4 ring-1 sm:flex-row sm:items-center sm:gap-4 sm:pr-11">
			<span className="ring-border/60 bg-background inline-flex size-9 shrink-0 items-center justify-center rounded-lg ring-1">
				<Icon className="size-5" />
			</span>

			<div className="min-w-0 flex-1">
				<p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
					<Lightbulb className="size-3" />
					Did you know?
				</p>
				<p className="text-foreground mt-0.5 text-sm leading-snug">
					Dig any site with a single right click using the digga {name}. No copy paste, no typing.
				</p>
			</div>

			<Link
				href={url}
				target="_blank"
				rel="noreferrer noopener"
				data-umami-event="install-extension"
				data-umami-event-source="lookup-tip"
				data-umami-event-browser={browser}
				className="bg-foreground text-background hover:bg-foreground/90 inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
			>
				<Icon className="size-4" />
				{action}
			</Link>

			<button
				type="button"
				onClick={dismiss}
				aria-label="Dismiss tip"
				data-umami-event="dismiss-extension"
				data-umami-event-browser={browser}
				className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-2.5 right-2.5 rounded-md p-1 transition-colors"
			>
				<X className="size-4" />
			</button>
		</aside>
	);
};

export default ExtensionTip;
