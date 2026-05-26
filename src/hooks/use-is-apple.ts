'use client';

import { useEffect, useState } from 'react';

import { isAppleDevice } from '@/lib/utils';

export function useIsApple(): boolean {
	const [isApple, setIsApple] = useState(false);

	useEffect(() => {
		setIsApple(isAppleDevice());
	}, []);

	return isApple;
}
