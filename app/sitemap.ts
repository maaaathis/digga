import type { MetadataRoute } from 'next';
import { parse as parseTldts } from 'tldts';

import { EXAMPLE_DOMAINS } from '@/lib/data';
import { getTopDomains } from '@/lib/search';
import { deduplicate } from '@/lib/utils';

const RESULTS_SUBPATHS = ['', '/dns', '/certs', '/subdomains', '/whois'];

const generateSitemapPaths = async (): Promise<string[]> => {
  const topDomains = await getTopDomains(1000);
  const combinedDomains = deduplicate([...EXAMPLE_DOMAINS, ...topDomains]);

  const tlds = deduplicate(
    combinedDomains.map((domain) => parseTldts(domain).publicSuffix)
  );

  const allDomains = [
    ...combinedDomains,
    ...combinedDomains.map((domain) => `www.${domain}`),
    ...tlds,
  ].sort();

  return allDomains.flatMap((domain) =>
    RESULTS_SUBPATHS.map((suffix) => `/lookup/${domain}${suffix}`)
  );
};

const createSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  if (!process.env.SITE_URL) {
    return [];
  }

  const paths = await generateSitemapPaths();
  const siteUrl = process.env.SITE_URL;

  const sitemapEntries = paths.map((url) => ({
    url: `${siteUrl}${url}`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 0.5,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    ...sitemapEntries,
  ];
};

export default createSitemap;
