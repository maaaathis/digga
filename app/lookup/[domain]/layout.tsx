import { ExternalLinkIcon } from 'lucide-react';
import { headers } from 'next/headers';
import type { FC, ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import RelatedDomains from '@/components/RelatedDomains';
import ResultsTabs from '@/components/ResultsTabs';
import SearchForm from '@/components/SearchForm';
import { isAvailable } from '@/lib/whois';

type LookupLayoutProps = {
  children: ReactNode;
  params: {
    domain: string;
  };
};

const LookupLayout: FC<LookupLayoutProps> = ({
  children,
  params: { domain },
}) => {
  const headersList = headers();
  const url = headersList.get('next-url') || '';

  const isStandalone = new URLSearchParams(url).has('standalone');

  const checkAvailability = async (domain: string) => {
    if ((await isAvailable(domain)) !== 'registered') {
      return (
        <Alert>
          <AlertTitle>Not registered</AlertTitle>
          <AlertDescription>
            This Domain is currently not registered.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <>
      <title>{`Results for ${domain} - Domain Digger`}</title>

      <div
        className={`container mb-8 max-w-xl ${isStandalone ? 'hidden' : null}`}
      >
        <SearchForm initialValue={domain} />
      </div>

      <div className="container">
        <h1 className="mb-2 text-4xl font-bold">
          Results for{' '}
          <a
            href={`https://${domain}`}
            target="_blank"
            className="font-extrabold underline-offset-2 hover:underline"
            rel="noreferrer"
          >
            {domain} <ExternalLinkIcon className="inline-block no-underline" />
          </a>
        </h1>

        <RelatedDomains domain={domain} />
        <ResultsTabs domain={domain} />

        {checkAvailability(domain)}
        {children}
      </div>
    </>
  );
};

export default LookupLayout;
