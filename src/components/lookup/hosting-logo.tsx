'use client';

import { useState } from 'react';
import type { FC } from 'react';

type HostingLogoProps = {
	domain: string;
	name: string;
};

const HostingLogo: FC<HostingLogoProps> = ({ domain, name }) => {
	const [failed, setFailed] = useState(false);

	return (
		<span className="flex items-center gap-1.5">
			{failed ? null : (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
					alt=""
					width={16}
					height={16}
					loading="lazy"
					decoding="async"
					onError={() => setFailed(true)}
					className="size-4 shrink-0 rounded-sm"
				/>
			)}
			<span className="truncate">{name}</span>
		</span>
	);
};

export default HostingLogo;
