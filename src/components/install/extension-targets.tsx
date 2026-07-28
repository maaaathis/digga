import type { FC, SVGProps } from 'react';

import ChromeIcon from '@/components/brand/chrome-icon';
import FirefoxIcon from '@/components/brand/firefox-icon';
import type { BrowserTarget } from '@/lib/browser';
import { CHROME_EXTENSION_URL, FIREFOX_EXTENSION_URL } from '@/lib/data';

export type ExtensionTarget = {
	browser: BrowserTarget;
	name: string;
	action: string;
	actionShort: string;
	url: string;
	Icon: FC<SVGProps<SVGSVGElement>>;
};

export const EXTENSION_TARGETS: Record<BrowserTarget, ExtensionTarget> = {
	chrome: {
		browser: 'chrome',
		name: 'Chrome extension',
		action: 'Add to Chrome',
		actionShort: 'Add',
		url: CHROME_EXTENSION_URL,
		Icon: ChromeIcon,
	},
	firefox: {
		browser: 'firefox',
		name: 'Firefox extension',
		action: 'Add to Firefox',
		actionShort: 'Add',
		url: FIREFOX_EXTENSION_URL,
		Icon: FirefoxIcon,
	},
};

export const EXTENSION_TARGET_LIST: ExtensionTarget[] = [
	EXTENSION_TARGETS.chrome,
	EXTENSION_TARGETS.firefox,
];
