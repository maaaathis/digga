import Link from 'next/link';
import type { FC } from 'react';

import { TOOL_LIST } from '@/lib/tools';

const Footer: FC = () => (
	<footer className="mt-24 w-full px-5 pb-8 md:px-8">
		<div className="mx-auto max-w-6xl">
			<div className="divider-soft h-px w-full" />

			<nav aria-label="Tools" className="mt-8">
				<p className="text-muted-foreground mb-3 text-xs tracking-wider uppercase">Tools</p>
				<ul className="flex flex-wrap gap-x-5 gap-y-2">
					{TOOL_LIST.map(tool => (
						<li key={tool.slug}>
							<Link
								href={`/${tool.slug}`}
								className="text-muted-foreground hover:text-foreground text-sm transition-colors"
							>
								{tool.name}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			<div className="text-muted-foreground mt-8 flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
				<p>digga is open source under AGPL 3.0.</p>
				<div className="flex items-center gap-5">
					<Link
						href="https://github.com/maaaathis/digga"
						target="_blank"
						rel="noreferrer noopener"
						className="hover:text-foreground transition-colors"
					>
						GitHub
					</Link>
				</div>
			</div>
		</div>
	</footer>
);

export default Footer;
