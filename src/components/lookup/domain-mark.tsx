'use client';

import type { FC } from 'react';
import useSWR from 'swr';

import { hasFavicon } from '@/app/actions/favicon';

type DomainMarkProps = {
	domain: string;
};

const DomainMark: FC<DomainMarkProps> = ({ domain }) => {
	const { data: hasIcon } = useSWR(['favicon-check', domain], () => hasFavicon(domain), {
		revalidateOnFocus: false,
		revalidateIfStale: false,
		dedupingInterval: 60 * 60 * 1000,
	});

	if (hasIcon === false) return null;

	return (
		<span className="bg-card ring-border/60 inline-flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1 sm:size-16">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={`https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`}
				alt=""
				width={32}
				height={32}
				loading="eager"
				decoding="async"
				className="size-8 rounded-lg"
			/>
		</span>
	);
};

export default DomainMark;
