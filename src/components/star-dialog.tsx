'use client';

import { Star } from 'lucide-react';
import { type ComponentRef, type FC, useEffect, useRef, useState } from 'react';

import { useStargazers } from '@/app/api/stargazers/hook';
import GithubIcon from '@/components/brand/github-icon';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const REPO_URL = 'https://github.com/maaaathis/digga';
const STARRED_KEY = 'digga:starReminder.starred';
const DISMISSED_KEY = 'digga:starReminder.lastDismissed';
const SKIP_DELAY = 800;

const compactNumber = (value: number) =>
	new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
		.format(value)
		.toLowerCase();

type StarDialogProps = { domain: string };

const StarDialog: FC<StarDialogProps> = ({ domain }) => {
	const { data } = useStargazers();
	const [dismissed, setDismissed] = useState(false);
	const [canSkip, setCanSkip] = useState(false);
	const starRef = useRef<ComponentRef<'button'>>(null);

	const hasStargazers = Boolean(data && data.recentStargazers.length > 0);
	const open = hasStargazers && !dismissed;

	useEffect(() => {
		if (!open) return;
		trackEvent('star-reminder-show', { domain });
		const timeout = setTimeout(() => setCanSkip(true), SKIP_DELAY);
		return () => clearTimeout(timeout);
	}, [open, domain]);

	const dismiss = () => {
		setDismissed(true);
		window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(Date.now()));
		trackEvent('star-reminder-dismiss', { domain });
	};

	const handleStar = () => {
		setDismissed(true);
		window.localStorage.setItem(STARRED_KEY, JSON.stringify(true));
		trackEvent('star-reminder-click', { domain });
		window.open(REPO_URL, '_blank', 'noopener,noreferrer');
	};

	if (!open || !data) return null;

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

export default StarDialog;
