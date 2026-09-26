import { Lightbulb } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

import { EXTENSION_TARGET_LIST } from '@/components/install/extension-targets';
import ExtensionTipDismiss from '@/components/lookup/extension-tip-dismiss';
import { browserOnlyClass } from '@/lib/browser';
import { cn } from '@/lib/utils';

const ExtensionTip: FC = () => (
	<>
		{EXTENSION_TARGET_LIST.map(({ browser, name, action, url, Icon }) => (
			<aside
				key={browser}
				className={cn(
					'extension-tip ring-foreground/10 bg-card relative mb-8 flex flex-col gap-3 rounded-xl p-4 ring-1 sm:flex-row sm:items-center sm:gap-4 sm:pr-11',
					browserOnlyClass(browser),
				)}
			>
				<span className="ring-border/60 bg-background inline-flex size-9 shrink-0 items-center justify-center rounded-lg ring-1">
					<Icon className="size-5" />
				</span>

				<div className="min-w-0 flex-1">
					<p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
						<Lightbulb className="size-3" />
						Did you know?
					</p>
					<p className="text-foreground mt-0.5 text-sm leading-snug">
						Dig any site with a single right click using the digga {name}. No copy paste, no typing.
					</p>
				</div>

				<Link
					href={url}
					target="_blank"
					rel="noreferrer noopener"
					data-umami-event="install-extension"
					data-umami-event-source="lookup-tip"
					data-umami-event-browser={browser}
					className="bg-foreground text-background hover:bg-foreground/90 inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
				>
					<Icon className="size-4" />
					{action}
				</Link>

				<ExtensionTipDismiss browser={browser} />
			</aside>
		))}
	</>
);

export default ExtensionTip;
