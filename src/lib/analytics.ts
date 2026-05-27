declare global {
	interface Window {
		umami?: {
			track: (event: string, data?: Record<string, unknown>) => void;
		};
	}
}

export function trackEvent(event: string, data?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return;
	window.umami?.track(event, data);
}
