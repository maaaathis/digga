import type { MetadataRoute } from 'next';

import { SITE_DESCRIPTION, SITE_TAGLINE } from '@/lib/data';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: `digga · ${SITE_TAGLINE}`,
		short_name: 'digga',
		description: SITE_DESCRIPTION,
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#ffffff',
		icons: [
			{
				src: '/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/android-chrome-256x256.png',
				sizes: '256x256',
				type: 'image/png',
			},
		],
	};
}
