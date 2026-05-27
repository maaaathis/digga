import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactCompiler: true,
	async headers() {
		return [
			{
				// RFC 8288 Link header.
				source: '/',
				headers: [
					{
						key: 'Link',
						value: '</llms.txt>; rel="service-doc"; type="text/plain"',
					},
				],
			},
		];
	},
};

export default nextConfig;
