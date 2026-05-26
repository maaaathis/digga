'use client';

import { AlertOctagon, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

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
		<div className="mx-auto max-w-2xl px-4 pt-24 pb-16 text-center">
			<div className="bg-destructive/10 text-destructive mx-auto mb-6 inline-flex size-14 items-center justify-center rounded-2xl">
				<AlertOctagon className="size-7" />
			</div>
			<h1 className="text-foreground text-2xl font-semibold tracking-tight">
				Something went sideways
			</h1>
			<p className="text-muted-foreground mt-3 text-base">
				We could not complete the lookup. This is usually transient. Try again in a moment.
			</p>
			<Button onClick={reset} className="mt-6 gap-2">
				<RotateCcw className="size-4" />
				Retry
			</Button>
		</div>
	);
}
