import Link from 'next/link';
import React, { type FC, Fragment, ReactElement } from 'react';
import whoiser, { type WhoisSearchResult } from 'whoiser';

import StyledError from '@/components/StyledError';
import { getBaseDomain, getTLD } from '@/lib/utils';

const lookupWhois = async (domain: string) => {
  const result = await whoiser(domain, {
    raw: true,
    timeout: 3000,
  });

  const mappedResults: Record<string, string> = {};
  for (const key in result) {
    mappedResults[key] = (result[key] as WhoisSearchResult).__raw as string;
  }

  return mappedResults;
};

type WhoisResultsPageProps = {
  params: {
    domain: string;
  };
};

const WhoisResultsPage: FC<WhoisResultsPageProps> = async ({
  params: { domain },
}): Promise<ReactElement> => {
  const baseDomain = getBaseDomain(domain);
  const data = await lookupWhois(baseDomain);

  const tryAtICANN = (
    <>
      <span> Try a direct request at the </span>
      <Link
        href={`https://lookup.icann.org/whois/en?q=${baseDomain}&t=a`}
        target="_blank"
        rel="noreferrer noopener"
        className="cursor-pointer select-none underline decoration-muted-foreground decoration-dotted underline-offset-4 hover:underline hover:decoration-dashed"
      >
        ICANN
      </Link>
      .
    </>
  );

  // .ch TLD doesn't support whois via api routes :c
  if (getTLD(domain) === 'ch') {
    return (
      <StyledError
        title="WHOIS Data unavailable"
        description={
          <>
            <span>
              SWITCH, the registry for .ch TLDs, does not support automated
              WHOIS requests.{' '}
            </span>
            <br />
            <span> Try a direct request at </span>
            <Link
              href="https://www.nic.ch/whois/"
              target="_blank"
              rel="noreferrer noopener"
              className="cursor-pointer select-none underline decoration-muted-foreground decoration-dotted underline-offset-4 hover:underline hover:decoration-dashed"
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
          <h2 className="mb-4 mt-8 text-3xl font-bold tracking-tight">{key}</h2>
          {data[key] !== undefined ? (
            <code>
              {data[key].split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </code>
          ) : (
            <p className="text-opacity-80">No results found.</p>
          )}
        </Fragment>
      ))}
      <p className="mt-5 text-xs italic text-opacity-80">
        Make a direct whois request at the{' '}
        <Link
          href={`https://lookup.icann.org/whois/en?q=${baseDomain}&t=a`}
          target="_blank"
          rel="noreferrer noopener"
          className="cursor-pointer select-none decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:decoration-slate-300"
        >
          ICANN
        </Link>
        .
      </p>
    </>
  );
};

export default WhoisResultsPage;
