'use client';

import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
	const subscribe = (onChange: () => void) => {
		const mql = window.matchMedia(query);
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	};
	const getSnapshot = () => window.matchMedia(query).matches;
	const getServerSnapshot = () => false;

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
