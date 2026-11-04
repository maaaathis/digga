'use client';

import { type FC, useState } from 'react';

import { cn } from '@/lib/utils';

type CountryFlagProps = {
	code: string | null | undefined;
	className?: string;
	title?: string;
};

/** SVG country flag (works everywhere, unlike emoji flags on Windows). */
const CountryFlag: FC<CountryFlagProps> = ({ code, className, title }) => {
	const [error, setError] = useState(false);
	if (!code || !/^[a-z]{2}$/i.test(code) || error) return null;
	return (
		// Remote SVG flag with an onError fallback; next/image adds no value here.
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
			alt={title ?? ''}
			title={title}
			width={20}
			height={15}
			loading="lazy"
			decoding="async"
			onError={() => setError(true)}
			className={cn(
				'ring-border/60 h-[15px] w-5 shrink-0 rounded-[3px] object-cover ring-1',
				className,
			)}
			draggable={false}
		/>
	);
};

export default CountryFlag;
