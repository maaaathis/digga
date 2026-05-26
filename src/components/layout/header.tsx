import Link from 'next/link';
import type { FC } from 'react';

import GithubIcon from '@/components/brand/github-icon';
import LogoMark from '@/components/brand/logo';
import ThemeToggle from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';

const Header: FC = () => (
	<header className="w-full px-5 pt-5 md:px-8">
		<div className="border-border/50 bg-background/60 supports-[backdrop-filter]:bg-background/40 mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 py-2 backdrop-blur">
			<Link
				href="/"
				className="hover:bg-accent/60 flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors"
				aria-label="digga home"
			>
				<LogoMark className="text-foreground h-7 w-auto" />
				<span className="bg-foreground text-background rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase">
					v2
				</span>
				<span className="sr-only">digga</span>
			</Link>
			<div className="flex items-center gap-1">
				<Button asChild variant="ghost" size="sm">
					<Link
						href="https://github.com/maaaathis/digga"
						target="_blank"
						rel="noreferrer noopener"
						aria-label="View source on GitHub"
					>
						<GithubIcon className="size-4" />
						<span className="hidden sm:inline">Source</span>
					</Link>
				</Button>
				<ThemeToggle />
			</div>
		</div>
	</header>
);

export default Header;
