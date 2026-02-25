import { ExternalLinkIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { FC, ReactElement, ReactNode } from 'react';

import { ShareButton } from '@/app/lookup/[domain]/_components/ShareButton';
import ExternalFavicon from '@/components/ExternalFavicon';
import RelatedDomains from '@/components/RelatedDomains';
import ResultsTabs from '@/components/ResultsTabs';
import SearchForm from '@/components/SearchForm';
import { isValidLookupDomain, normalizeDomain } from '@/lib/utils';

type LookupLayoutProps = {
  children: ReactNode;
  params: Promise<{
    domain: string;
  }>;
};

export const generateMetadata = async ({
  params: params,
}: LookupLayoutProps): Promise<Metadata> => {
  const propParams = await params;

  return {
    title: `Results for ${propParams.domain} · digga`,
    openGraph: {
      type: 'website',
      title: `Results for ${propParams.domain} · digga`,
      description: `Find DNS records, WHOIS data, SSL/TLS certificate history and more for ${propParams.domain}`,
    },
  };
};

const LookupLayout: FC<LookupLayoutProps> = async ({
  children,
  params: params,
}): Promise<ReactElement> => {
  const { domain: rawDomain } = await params;
  const domain = normalizeDomain(rawDomain);

  if (!isValidLookupDomain(domain)) {
    return notFound();
  }

  let isStandalone = false;

  return (
    <>
      <div
        className={`container mb-8 w-full md:w-5/6 xl:w-4/6 2xl:w-2/4 ${
          isStandalone ? 'hidden' : null
        }`}
      >
        <SearchForm
          initialValue={domain}
          autofocus={false}
          className="bg-background"
        />
      </div>
      <div className="container">
        <h1 className="mb-2">
          <span className="text-muted-foreground block">Results for</span>
          <span className="flex flex-row gap-2">
            <ExternalFavicon url={domain} />
            <Link
              className="font-clash decoration-muted-foreground block text-4xl font-bold tracking-wider underline-offset-4 hover:underline"
              href={`https://${domain}`}
              prefetch={false}
              target="_blank"
              rel="noreferrer noopener"
            >
              {domain} <ExternalLinkIcon className="inline-block" />
            </Link>
          </span>
        </h1>
        <div className="mt-2 mb-4 flex flex-row gap-2">
          <ShareButton />
          <div className="bg-secondary-foreground my-auto inline-block h-full min-h-[1em] w-0.5 self-stretch rounded" />
          <RelatedDomains domain={domain} />
        </div>
        <ResultsTabs domain={domain} />
        {children}
      </div>
    </>
  );
};

export default LookupLayout;
