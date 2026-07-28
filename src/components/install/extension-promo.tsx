import Link from 'next/link';
import type { FC } from 'react';

import { EXTENSION_TARGET_LIST } from '@/components/install/extension-targets';
import { browserOnlyClass } from '@/lib/browser';
import { cn } from '@/lib/utils';

const ExtensionPromo: FC = () => (
	<>
		{EXTENSION_TARGET_LIST.map(({ browser, name, action, actionShort, url, Icon }) => (
			<div
				key={browser}
				className={cn(
					'ring-border/60 bg-card/50 mt-10 flex w-full max-w-2xl items-center gap-3 rounded-2xl p-3 text-left ring-1 sm:gap-4 sm:p-4',
					browserOnlyClass(browser),
				)}
			>
				<span className="ring-border/60 bg-background inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
					<Icon className="size-6" />
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-foreground text-sm font-medium">New: the digga {name}</p>
					<p className="text-muted-foreground text-sm leading-snug">
						Right click any page to dig its domain. No copy paste, no typing.
					</p>
				</div>
				<Link
					href={url}
					target="_blank"
					rel="noreferrer noopener"
					data-umami-event="install-extension"
					data-umami-event-source="home-hero"
					data-umami-event-browser={browser}
					className="bg-foreground text-background hover:bg-foreground/90 inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
				>
					<Icon className="size-4" />
					<span className="hidden sm:inline">{action}</span>
					<span className="sm:hidden">{actionShort}</span>
				</Link>
			</div>
		))}
	</>
);

export default ExtensionPromo;
