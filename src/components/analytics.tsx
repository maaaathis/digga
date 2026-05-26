import Script from 'next/script';
import type { FC } from 'react';

const Analytics: FC = () => {
	const src = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT;
	const id = process.env.NEXT_PUBLIC_ANALYTICS_ID;
	const domains = process.env.NEXT_PUBLIC_ANALYTICS_DOMAINS ?? 'digga.dev';

	if (!src || !id) return null;

	return (
		<Script src={src} data-website-id={id} data-domains={domains} strategy="afterInteractive" />
	);
};

export default Analytics;
