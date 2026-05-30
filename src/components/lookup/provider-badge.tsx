import type { FC } from 'react';

type ProviderBadgeProps = {
	name: string;
	/** Domain whose favicon is shown as the logo. */
	domain: string;
	/** Short caption on the right, e.g. "Mail provider". */
	label: string;
};

const ProviderBadge: FC<ProviderBadgeProps> = ({ name, domain, label }) => (
	<div className="border-border/60 bg-muted/30 mb-2.5 flex items-center gap-2.5 rounded-lg border px-3 py-2">
		{/* eslint-disable-next-line @next/next/no-img-element */}
		<img
			src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
			alt=""
			width={20}
			height={20}
			loading="lazy"
			decoding="async"
			className="size-5 shrink-0 rounded"
			draggable={false}
		/>
		<span className="text-foreground truncate text-sm font-medium">{name}</span>
		<span className="text-muted-foreground ml-auto shrink-0 text-[11px] tracking-wide uppercase">
			{label}
		</span>
	</div>
);

export default ProviderBadge;
