'use client';

import { Lightbulb, X } from 'lucide-react';
import Link from 'next/link';
import { type FC, useEffect, useState } from 'react';

import ChromeIcon from '@/components/brand/chrome-icon';
import { CHROME_EXTENSION_URL } from '@/lib/data';

const DISMISSED_KEY = 'digga:chromeExtensionTip.dismissed';

const ExtensionTip: FC = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (localStorage.getItem(DISMISSED_KEY) === '1') return;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setVisible(true);
	}, []);

	const dismiss = () => {
		localStorage.setItem(DISMISSED_KEY, '1');
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<aside className="ring-foreground/10 bg-card relative mb-8 flex flex-col gap-3 rounded-xl p-4 ring-1 sm:flex-row sm:items-center sm:gap-4 sm:pr-11">
			<span className="ring-border/60 bg-background inline-flex size-9 shrink-0 items-center justify-center rounded-lg ring-1">
				<ChromeIcon className="size-5" />
			</span>

			<div className="min-w-0 flex-1">
				<p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
					<Lightbulb className="size-3" />
					Did you know?
				</p>
				<p className="text-foreground mt-0.5 text-sm leading-snug">
					Dig any site with a single right click using the digga Chrome extension. No copy paste, no
					typing.
				</p>
			</div>

			<Link
				href={CHROME_EXTENSION_URL}
				target="_blank"
				rel="noreferrer noopener"
				data-umami-event="install-extension"
				data-umami-event-source="lookup-tip"
				className="bg-foreground text-background hover:bg-foreground/90 inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
			>
				<ChromeIcon className="size-4" />
				Add to Chrome
			</Link>

			<button
				type="button"
				onClick={dismiss}
				aria-label="Dismiss tip"
				className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-2.5 right-2.5 rounded-md p-1 transition-colors"
			>
				<X className="size-4" />
			</button>
		</aside>
	);
};

export default ExtensionTip;
