'use client';

import Link from 'next/link';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import type { FC } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsApple } from '@/hooks/use-is-apple';
import { trackEvent } from '@/lib/analytics';
import { getTLD } from '@/lib/domain';
import { cn } from '@/lib/utils';

type LookupTabsProps = { domain: string };

type TabDef = {
	key: string;
	label: string;
	segment: string | null;
};

type TabWithIndex = TabDef & { index: string };

const TABS: TabWithIndex[] = [
	{ key: 'overview', label: 'Overview', segment: null, index: '01' },
	{ key: 'dns', label: 'DNS', segment: 'dns', index: '02' },
	{ key: 'whois', label: 'WHOIS', segment: 'whois', index: '03' },
	{ key: 'subdomains', label: 'Subdomains', segment: 'subdomains', index: '04' },
	{ key: 'email', label: 'Email', segment: 'email', index: '05' },
	{ key: 'tls', label: 'TLS', segment: 'tls', index: '06' },
];

const LookupTabs: FC<LookupTabsProps> = ({ domain }) => {
	const router = useRouter();
	const active = useSelectedLayoutSegment();
	const isApple = useIsApple();

	const hrefFor = (segment: string | null) =>
		segment === null ? `/lookup/${domain}` : `/lookup/${domain}/${segment}`;

	const trackTab = (key: string) =>
		trackEvent('lookup-tab', { tab: key, domain, tld: getTLD(domain) ?? undefined });

	const goToTab = (tab: TabWithIndex) => {
		trackTab(tab.key);
		router.push(hrefFor(tab.segment));
	};

	useHotkeys('alt+1', () => goToTab(TABS[0]), { preventDefault: true }, [domain, router]);
	useHotkeys('alt+2', () => goToTab(TABS[1]), { preventDefault: true }, [domain, router]);
	useHotkeys('alt+3', () => goToTab(TABS[2]), { preventDefault: true }, [domain, router]);
	useHotkeys('alt+4', () => goToTab(TABS[3]), { preventDefault: true }, [domain, router]);
	useHotkeys('alt+5', () => goToTab(TABS[4]), { preventDefault: true }, [domain, router]);
	useHotkeys('alt+6', () => goToTab(TABS[5]), { preventDefault: true }, [domain, router]);

	const hint = isApple ? '⌥' : 'Alt';

	return (
		<nav
			aria-label="Result sections"
			className="border-border/50 flex w-full items-end gap-7 overflow-x-auto overflow-y-hidden border-b"
		>
			{TABS.map((tab, position) => {
				const href = hrefFor(tab.segment);
				const isActive = (active ?? null) === tab.segment;
				return (
					<Tooltip key={tab.key}>
						<TooltipTrigger asChild>
							<Link
								href={href}
								prefetch
								onClick={() => trackTab(tab.key)}
								className={cn(
									'group relative inline-flex items-baseline gap-2 py-3 text-sm font-medium tracking-tight whitespace-nowrap transition-colors',
									isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
								)}
							>
								<span
									className={cn(
										'font-mono text-[10px] tabular-nums',
										isActive
											? 'text-foreground/70'
											: 'text-muted-foreground/60 group-hover:text-foreground/70',
									)}
								>
									{tab.index}
								</span>
								{tab.label}
								<span
									aria-hidden
									className={cn(
										'absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform',
										isActive
											? 'bg-foreground scale-x-100'
											: 'bg-foreground/40 group-hover:scale-x-100',
									)}
								/>
							</Link>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="font-mono text-[11px]">
							{hint} + {position + 1}
						</TooltipContent>
					</Tooltip>
				);
			})}
		</nav>
	);
};

export default LookupTabs;
