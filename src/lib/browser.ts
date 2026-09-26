export type BrowserTarget = 'chrome' | 'firefox';

export const EXTENSION_TIP_DISMISSED_KEY: Record<BrowserTarget, string> = {
	chrome: 'digga:chromeExtensionTip.dismissed',
	firefox: 'digga:firefoxExtensionTip.dismissed',
};

export const BROWSER_TARGET_SCRIPT = `(function(){var d=document.documentElement,f=/firefox|fxios/i.test(navigator.userAgent);if(f)d.dataset.browser='firefox';try{if(localStorage.getItem(f?'${EXTENSION_TIP_DISMISSED_KEY.firefox}':'${EXTENSION_TIP_DISMISSED_KEY.chrome}')==='1')d.dataset.extensionTipDismissed=''}catch(e){}})()`;

export const readBrowserTarget = (): BrowserTarget =>
	document.documentElement.dataset.browser === 'firefox' ? 'firefox' : 'chrome';

export const browserOnlyClass = (browser: BrowserTarget) => `browser-only-${browser}`;
