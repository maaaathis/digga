import type { MetadataRoute } from 'next';

import { EXAMPLE_DOMAINS } from '@/lib/data';
import { getTopDomains } from '@/lib/search';
import { deduplicate } from '@/lib/utils';

const RESULTS_SUBPATHS = ['', '/dns', '/certs', '/whois'];

const compareDomains = (a: string | null, b: string | null): number => {
  if (a === null) return b === null ? 0 : -1;
  if (b === null) return 1;
  return a.length === b.length ? a.localeCompare(b) : a.length - b.length;
};

const generateSitemapPaths = async (): Promise<string[]> => {
  const topDomains = await getTopDomains(1000);
  const combinedDomains = deduplicate([...EXAMPLE_DOMAINS, ...topDomains]);

  const allDomains = [
    ...combinedDomains,
    ...combinedDomains.map((domain) => `www.${domain}`),
  ].toSorted(compareDomains);

  return allDomains.flatMap((domain) =>
    RESULTS_SUBPATHS.map((suffix) => `/lookup/${domain}${suffix}`)
  );
};

const createSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    return [];
  }

  const paths = await generateSitemapPaths();
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
