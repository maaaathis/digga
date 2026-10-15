import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactCompiler: true,
	htmlLimitedBots:
		/Googlebot|[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|GPTBot|OAI-SearchBot|ChatGPT-User|PerplexityBot|Perplexity-User|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|CCBot|meta-externalagent|MistralAI-User|cohere-ai/i,
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
