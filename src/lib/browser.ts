export type BrowserTarget = 'chrome' | 'firefox';

export const BROWSER_TARGET_SCRIPT =
	"if(/firefox|fxios/i.test(navigator.userAgent))document.documentElement.dataset.browser='firefox'";

export const readBrowserTarget = (): BrowserTarget =>
	document.documentElement.dataset.browser === 'firefox' ? 'firefox' : 'chrome';

export const browserOnlyClass = (browser: BrowserTarget) => `browser-only-${browser}`;
