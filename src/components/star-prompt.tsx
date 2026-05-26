'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { type FC, useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';

import GithubIcon from '@/components/brand/github-icon';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

const COUNT_KEY = 'digga:lookupCount';
const SEEN_KEY = 'digga:starPromptSeen';
const THRESHOLD = 4;

type StarPromptProps = { domain: string };

const StarPrompt: FC<StarPromptProps> = ({ domain }) => {
	const [open, setOpen] = useState(false);
	const countedRef = useRef<string | null>(null);
	const starRef = useRef<ComponentRef<'a'>>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (countedRef.current === domain) return;
		countedRef.current = domain;

		if (localStorage.getItem(SEEN_KEY)) return;

		const next = Number(localStorage.getItem(COUNT_KEY) ?? '0') + 1;
		localStorage.setItem(COUNT_KEY, String(next));

		// Opening the dialog reacts to a localStorage-backed counter that only
		// exists on the client; this is a legitimate effect, not derived state.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (next >= THRESHOLD) setOpen(true);
	}, [domain]);

	const dismiss = () => {
		if (typeof window !== 'undefined') localStorage.setItem(SEEN_KEY, 'true');
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={value => {
				if (!value) dismiss();
			}}
		>
			<DialogContent
				className="sm:max-w-md"
				onOpenAutoFocus={event => {
					event.preventDefault();
					starRef.current?.focus();
				}}
			>
				<DialogHeader>
					<div className="bg-muted text-foreground mb-2 inline-flex size-11 items-center justify-center rounded-2xl">
						<Star className="size-5" />
					</div>
					<DialogTitle>Enjoying digga?</DialogTitle>
					<DialogDescription>
						You have run a few lookups now. digga is free and open source. A quick star on GitHub
						helps other people find it and keeps the project alive.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-2">
					<Button variant="ghost" onClick={dismiss}>
						Maybe later
					</Button>
					<Button asChild onClick={dismiss}>
						<Link
							ref={starRef}
							href="https://github.com/maaaathis/digga"
							target="_blank"
							rel="noreferrer noopener"
						>
							<GithubIcon className="size-4" />
							Star on GitHub
						</Link>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default StarPrompt;
