'use client';

import { Loader2, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type ChangeEvent, type FC, type FormEvent, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsApple } from '@/hooks/use-is-apple';
import { trackEvent } from '@/lib/analytics';
import { cleanForLookup, getTLD, isKnownTld } from '@/lib/domain';
import { cn, isAppleDevice } from '@/lib/utils';

type SearchFormProps = {
	initialValue?: string;
	autofocus?: boolean;
	className?: string;
	size?: 'default' | 'md' | 'lg';
};

const SearchForm: FC<SearchFormProps> = ({
	initialValue,
	autofocus,
	className,
	size = 'default',
}) => {
	const router = useRouter();
	const pathname = usePathname();

	const [value, setValue] = useState(initialValue ?? '');
	const [lastInitial, setLastInitial] = useState(initialValue);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const isApple = useIsApple();

	// Sync the field when the route-provided domain changes, without an effect.
	if (initialValue !== lastInitial) {
		setLastInitial(initialValue);
		setValue(initialValue ?? '');
	}

	useHotkeys(
		isAppleDevice() ? ['meta+k', '/'] : ['ctrl+k', '/'],
		() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		},
		{ preventDefault: true },
	);

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		setError(null);
		setSubmitting(true);

		const cleaned = cleanForLookup(value);
		if (!cleaned) {
			setError('Please enter a valid domain or URL.');
			setSubmitting(false);
			return;
		}

		if (!isKnownTld(cleaned)) {
			const tld = getTLD(cleaned);
			setError(
				tld ? `.${tld} is not a real top level domain.` : 'That is not a real top level domain.',
			);
			setSubmitting(false);
			return;
		}

		trackEvent('lookup', { domain: cleaned, tld: getTLD(cleaned) ?? undefined });

		const target = `/lookup/${cleaned}`;
		if (pathname === target) {
			router.refresh();
			setTimeout(() => setSubmitting(false), 200);
			return;
		}

		router.push(target);
	};

	return (
		<div className={cn('w-full', className)}>
			<form className="group relative flex w-full" onSubmit={onSubmit}>
				<div
					className={cn(
						'bg-background/80 ring-border/60 supports-[backdrop-filter]:bg-background/60 group-focus-within:ring-foreground/30 relative flex w-full items-center gap-2 rounded-2xl p-1.5 shadow-sm ring-1 backdrop-blur transition-shadow',
						size === 'md' && 'rounded-2xl p-2',
						size === 'lg' && 'ring-foreground/15 rounded-3xl p-2 shadow-lg ring-2',
					)}
				>
					<Search
						className={cn(
							'text-muted-foreground ml-2 size-4 shrink-0',
							size === 'md' && 'ml-2.5 sm:size-5',
							size === 'lg' && 'ml-3 size-5',
						)}
					/>
					<Input
						ref={inputRef}
						type="text"
						inputMode="url"
						spellCheck={false}
						autoCapitalize="none"
						autoCorrect="off"
						autoComplete="off"
						required
						placeholder="example.com"
						aria-label="Domain"
						value={value}
						disabled={submitting}
						autoFocus={autofocus}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
						className={cn(
							'h-10 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent',
							size === 'md' && 'h-11 text-base font-medium sm:text-lg',
							size === 'lg' && 'h-12 text-2xl font-semibold tracking-tight sm:text-3xl',
						)}
					/>
					<kbd className="bg-background text-muted-foreground ring-border/70 pointer-events-none mr-1 hidden h-6 items-center gap-0.5 rounded-md px-2 font-mono text-[11px] font-medium tracking-tight ring-1 select-none sm:inline-flex">
						<span>{isApple ? '⌘' : 'Ctrl'}</span>
						<span aria-hidden className="opacity-50">
							+
						</span>
						<span>K</span>
					</kbd>
					<Button
						type="submit"
						disabled={submitting}
						className={cn(
							'h-10 rounded-xl px-5',
							size === 'md' && 'h-11 rounded-xl px-5',
							size === 'lg' && 'h-12 rounded-2xl px-6 text-base',
						)}
						aria-label="Lookup domain"
					>
						{submitting ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<>
								<Search className="size-4 md:hidden" />
								<span className="hidden md:inline">Lookup</span>
							</>
						)}
					</Button>
				</div>
			</form>
			{error ? (
				<p className="text-destructive mt-3 text-center text-sm">{error}</p>
			) : (
				<p className="text-muted-foreground mt-3 text-center text-sm">
					Apex, subdomain, or URL. We figure it out.
				</p>
			)}
		</div>
	);
};

export default SearchForm;
