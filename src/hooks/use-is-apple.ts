'use client';

import { useSyncExternalStore } from 'react';

import { isAppleDevice } from '@/lib/utils';

const noopSubscribe = () => () => {};

export function useIsApple(): boolean {
	return useSyncExternalStore(
		noopSubscribe,
		() => isAppleDevice(),
		() => false,
	);
}
