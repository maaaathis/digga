'use client';

import { X } from 'lucide-react';
import type { FC } from 'react';

import { type BrowserTarget, EXTENSION_TIP_DISMISSED_KEY } from '@/lib/browser';

type ExtensionTipDismissProps = { browser: BrowserTarget };

const ExtensionTipDismiss: FC<ExtensionTipDismissProps> = ({ browser }) => {
	const dismiss = () => {
		try {
			localStorage.setItem(EXTENSION_TIP_DISMISSED_KEY[browser], '1');
		} catch {}
		document.documentElement.dataset.extensionTipDismissed = '';
	};

	return (
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
	);
};

export default ExtensionTipDismiss;
