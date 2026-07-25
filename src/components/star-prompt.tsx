'use client';

import dynamic from 'next/dynamic';
import { type FC, useEffect, useRef, useState } from 'react';

const COUNT_KEY = 'digga:lookupCount';
const STARRED_KEY = 'digga:starReminder.starred';
const DISMISSED_KEY = 'digga:starReminder.lastDismissed';
const THRESHOLD = 4;
const COOLDOWN = 7 * 24 * 60 * 60 * 1000;

const StarDialog = dynamic(() => import('@/components/star-dialog'), { ssr: false });

function readNumber(key: string): number {
	const raw = window.localStorage.getItem(key);
	const value = Number(raw ?? '0');
	return Number.isFinite(value) ? value : 0;
}

type StarPromptProps = { domain: string };

const StarPrompt: FC<StarPromptProps> = ({ domain }) => {
	const [eligible, setEligible] = useState(false);
	const countedRef = useRef<string | null>(null);

	useEffect(() => {
		if (countedRef.current === domain) return;
		countedRef.current = domain;

		const next = readNumber(COUNT_KEY) + 1;
		window.localStorage.setItem(COUNT_KEY, String(next));

		if (window.localStorage.getItem(STARRED_KEY) === 'true') return;
		if (next < THRESHOLD) return;
		if (Date.now() - readNumber(DISMISSED_KEY) < COOLDOWN) return;

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setEligible(true);
	}, [domain]);

	if (!eligible) return null;

	return <StarDialog domain={domain} />;
};

export default StarPrompt;
