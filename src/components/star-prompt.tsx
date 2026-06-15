'use client';

import { useLocalStorage } from '@uidotdev/usehooks';
import { Star } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';

import { useStargazers } from '@/app/api/stargazers/hook';
import GithubIcon from '@/components/brand/github-icon';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const REPO_URL = 'https://github.com/maaaathis/digga';
const COUNT_KEY = 'digga:lookupCount';
const STARRED_KEY = 'digga:starReminder.starred';
const DISMISSED_KEY = 'digga:starReminder.lastDismissed';
const THRESHOLD = 4;
const COOLDOWN = 7 * 24 * 60 * 60 * 1000;
const SKIP_DELAY = 800;

const compactNumber = (value: number) =>
	new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
		.format(value)
		.toLowerCase();

type StarPromptProps = { domain: string };

const StarPrompt: FC<StarPromptProps> = ({ domain }) => {
	const { data } = useStargazers();
	const [starred, setStarred] = useLocalStorage(STARRED_KEY, false);
	const [lastDismissed, setLastDismissed] = useLocalStorage(DISMISSED_KEY, 0);

	const [open, setOpen] = useState(false);
	const [count, setCount] = useState(0);
	const [canSkip, setCanSkip] = useState(false);
	const countedRef = useRef<string | null>(null);
	const starRef = useRef<ComponentRef<'button'>>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (countedRef.current === domain) return;
		countedRef.current = domain;

		const next = Number(localStorage.getItem(COUNT_KEY) ?? '0') + 1;
		localStorage.setItem(COUNT_KEY, String(next));
		setCount(next);
	}, [domain]);

	useEffect(() => {
		if (starred) return;
		if (count < THRESHOLD) return;
		if (Date.now() - lastDismissed < COOLDOWN) return;
		if (!data || data.recentStargazers.length === 0) return;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setOpen(true);
	}, [starred, count, lastDismissed, data]);

	useEffect(() => {
		if (!open) return;
		trackEvent('star-reminder-show', { domain });
		const timeout = setTimeout(() => setCanSkip(true), SKIP_DELAY);
		return () => clearTimeout(timeout);
	}, [open, domain]);

	const dismiss = () => {
		setOpen(false);
		setLastDismissed(Date.now());
		trackEvent('star-reminder-dismiss', { domain });
	};

	const handleStar = () => {
		setOpen(false);
		setStarred(true);
		trackEvent('star-reminder-click', { domain });
		window.open(REPO_URL, '_blank', 'noopener,noreferrer');
	};

	if (!open || !data || data.recentStargazers.length === 0) return null;

	const stargazers = data.recentStargazers.slice(0, 4);
	const overflow = Math.max(0, data.totalStars - stargazers.length);

	return (
		<AlertDialog
			open={open}
			onOpenChange={next => {
				if (!next) dismiss();
			}}
		>
			<AlertDialogContent
				onOpenAutoFocus={event => {
					event.preventDefault();
					starRef.current?.focus();
				}}
			>
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex -space-x-2">
						{stargazers.map((user, index) => (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								key={user.name}
								src={user.avatarUrl}
								alt={`${user.name} on GitHub`}
								width={36}
								height={36}
								referrerPolicy="no-referrer"
								className="avatar-float border-popover bg-muted size-9 rounded-full border-2"
								style={{ animationDelay: `-${index * 0.4}s` }}
							/>
						))}
						{overflow > 0 ? (
							<span className="border-popover bg-muted text-muted-foreground inline-flex size-9 items-center justify-center rounded-full border-2 text-[11px] font-semibold tabular-nums">
								+{compactNumber(overflow)}
							</span>
						) : null}
					</div>

					<div className="space-y-1.5">
						<AlertDialogTitle>Find digga useful?</AlertDialogTitle>
						<AlertDialogDescription>
							digga is free and open source. A star on GitHub helps more people discover it and
							keeps the project moving forward.
						</AlertDialogDescription>
					</div>

					<div className="w-full space-y-2">
						<Button
							ref={starRef}
							onClick={handleStar}
							className="w-full justify-between"
							aria-label={`Star digga on GitHub, ${data.totalStars.toLocaleString('en-US')} stars`}
						>
							<span className="inline-flex items-center gap-2">
								<GithubIcon className="size-4" />
								Star
							</span>
							<span className="border-primary-foreground/25 inline-flex items-center gap-1.5 border-l pl-3 tabular-nums">
								<Star className="size-3.5 fill-current" />
								{data.totalStars.toLocaleString('en-US')}
							</span>
						</Button>
						<AlertDialogCancel
							variant="ghost"
							disabled={!canSkip}
							className={cn('w-full', !canSkip && 'cursor-not-allowed opacity-50')}
						>
							Maybe later
						</AlertDialogCancel>
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default StarPrompt;
