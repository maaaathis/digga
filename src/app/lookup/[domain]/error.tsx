'use client';

import { AlertOctagon, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

import StateNotice from '@/components/lookup/state-notice';
import { Button } from '@/components/ui/button';

export default function LookupError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Lookup error:', error);
	}, [error]);

	return (
		<StateNotice
			tone="error"
			titleAs="h1"
			icon={<AlertOctagon className="size-9" />}
			title="Something went sideways"
			description="We could not complete the lookup. This is usually transient, so try again in a moment."
		>
			<Button onClick={reset} size="lg" className="h-12 px-7 text-base font-semibold">
				<RotateCcw data-icon="inline-start" className="size-4" />
				Retry
			</Button>
		</StateNotice>
	);
}
