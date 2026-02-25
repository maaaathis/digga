import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { type FC, Fragment, ReactElement } from 'react';
import whoiser, { type WhoisSearchResult } from 'whoiser';

import StyledError from '@/components/StyledError';
import { getBaseDomain, getTLD, isValidLookupDomain } from '@/lib/utils';

export const generateMetadata = async ({
  params: params,
}: WhoisResultsPageProps): Promise<Metadata> => {
  const { domain } = await params;
  return {
    openGraph: {
      url: `/lookup/${domain}/whois`,
    },
    alternates: {
      canonical: `/lookup/${domain}/whois`,
    },
  };
};

const lookupWhois = async (domain: string) => {
  try {
    const result = await whoiser(domain, {
      raw: true,
      timeout: 3000,
    });

    const mappedResults: Record<string, string> = {};
    for (const key in result) {
      mappedResults[key] = (result[key] as WhoisSearchResult).__raw as string;
    }

    return mappedResults;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);

    // TLD not supported
    if (
      errorMessage.includes('TLD for') &&
      errorMessage.includes('not supported')
    ) {
      console.warn(
        `WHOIS lookup skipped: TLD not supported for domain ${domain}`
      );
      return {};
    }

    // whoiser stream/transform algorithm error (Node.js internal error)
    if (
      errorMessage.includes('transformAlgorithm') ||
      errorMessage.includes('kState')
    ) {
      console.warn(
        `WHOIS lookup failed: Stream processing error for domain ${domain}`,
        error
      );
      return {};
    }

    // Timeout or connection errors
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED')
    ) {
      console.warn(
        `WHOIS lookup failed: Connection timeout/refused for domain ${domain}`
      );
      return {};
    }

    console.error(`WHOIS lookup error for domain ${domain}:`, error);
    return {};
  }
};

type WhoisResultsPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

const WhoisResultsPage: FC<WhoisResultsPageProps> = async ({
  params: params,
}): Promise<ReactElement> => {
  const { domain } = await params;
  const baseDomain = getBaseDomain(domain);
  if (!isValidLookupDomain(baseDomain)) return notFound();

  const data = await lookupWhois(baseDomain);

  const tryAtICANN = (
    <>
      <span> Try a direct request at the </span>
      <Link
        href={`https://lookup.icann.org/whois/en?q=${baseDomain}&t=a`}
        target="_blank"
        rel="noreferrer noopener"
        className="decoration-muted-foreground cursor-pointer underline decoration-dotted underline-offset-4 select-none hover:underline hover:decoration-dashed"
      >
        ICANN
      </Link>
      .
    </>
  );

  // .ch & .li TLD doesn't support whois via api routes :c
  if (getTLD(domain) === 'ch' || getTLD(domain) === 'li') {
    return (
      <StyledError
        title="WHOIS Data unavailable"
        description={
          <>
            <span>
              SWITCH, the registry for .ch & .li TLDs, does not support
              automated WHOIS requests.{' '}
            </span>
            <br />
            <span> Try a direct request at </span>
            <Link
              href={
                getTLD(domain) === 'ch'
                  ? 'https://www.nic.ch/whois/'
                  : 'https://www.nic.li/whois/'
              }
              target="_blank"
              rel="noreferrer noopener"
              className="decoration-muted-foreground cursor-pointer underline decoration-dotted underline-offset-4 select-none hover:underline hover:decoration-dashed"
            >
              SWITCH
            </Link>
            .
          </>
        }
      />
    );
  }

  if (Object.keys(data).length === 0) {
    return (
      <StyledError
        title="WHOIS Data unavailable"
        description={
          <>
            <span>No WHOIS server found.</span>
            <br />
            {tryAtICANN}
          </>
        }
      />
    );
  }

  if (Object.keys(data).length === 1 && !data[Object.keys(data)[0]]) {
    return (
      <StyledError
        title="WHOIS Data unavailable"
        description={
          <>
            <span>No WHOIS server with valid data found.</span>
            <br />
            {tryAtICANN}
          </>
        }
      />
    );
  }

  return (
    <>
      {Object.keys(data).map((key) => (
        <Fragment key={key}>
          <h2 className="mt-8 mb-4 text-3xl font-bold tracking-tight">{key}</h2>
          {data[key] !== undefined ? (
            <code className="break-words">
              {data[key].split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </code>
          ) : (
            <p className="text-opacity-80">No results found.</p>
          )}
        </Fragment>
      ))}
      <p className="text-opacity-80 mt-5 text-xs italic">
        Make a direct whois request at the{' '}
        <Link
          href={`https://lookup.icann.org/whois/en?q=${baseDomain}&t=a`}
          target="_blank"
          rel="noreferrer noopener"
          className="cursor-pointer decoration-slate-700 decoration-dotted underline-offset-4 select-none hover:underline dark:decoration-slate-300"
        >
          ICANN
        </Link>
        .
      </p>
    </>
  );
};

export default WhoisResultsPage;
