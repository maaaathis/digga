import Link from 'next/link';
import React, { type FC, Fragment, ReactElement } from 'react';
import whoiser, { type WhoisSearchResult } from 'whoiser';

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
  const data = await lookupWhois(domain);

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
          ) : null}
        </Fragment>
      ))}
      <p className="mt-5 text-xs italic text-opacity-80">
        Make a direct whois request at the{' '}
        <Link
          href={`https://lookup.icann.org/whois/en?q=${domain}&t=a`}
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
