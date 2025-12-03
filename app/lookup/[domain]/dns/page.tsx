import { Metadata } from 'next';
import React, { FC, ReactElement } from 'react';

import DnsHistoryButton from '@/app/lookup/[domain]/dns/_components/DnsHistoryButton';
import DnsTable from '@/app/lookup/[domain]/dns/_components/DnsTable';
import FlushCloudflareDnsCacheButton from '@/app/lookup/[domain]/dns/_components/FlushCloudflareDnsCacheButton';
import FlushGoogleDnsCacheButton from '@/app/lookup/[domain]/dns/_components/FlushGoogleDnsCacheButton';
import ResolverSelector from '@/app/lookup/[domain]/dns/_components/ResolverSelector';
import DomainNotRegistered from '@/components/DomainNotRegistered';
import { getIpsInfo } from '@/lib/ips';
import AlibabaDoHResolver from '@/lib/resolvers/AlibabaDoHResolver';
import AuthoritativeResolver from '@/lib/resolvers/AuthoritativeResolver';
import CloudflareDoHResolver from '@/lib/resolvers/CloudflareDoHResolver';
import { type RawRecord } from '@/lib/resolvers/DnsResolver';
import GoogleDoHResolver from '@/lib/resolvers/GoogleDoHResolver';
import { isDomainAvailable } from '@/lib/whois';

const getResolver = (resolverName: string | undefined) => {
  switch (resolverName) {
    case 'cloudflare':
      return new CloudflareDoHResolver();
    case 'google':
      return new GoogleDoHResolver();
    case 'alibaba':
      return new AlibabaDoHResolver();
    default:
      return new AuthoritativeResolver();
  }
};

type LookupDomainProps = {
  params: Promise<{
    domain: string;
  }>;
  searchParams: Promise<{
    resolver?: string;
  }>;
};

export const fetchCache = 'default-no-store';

export const generateMetadata = async ({
  params: params,
  searchParams: searchParams,
}: LookupDomainProps): Promise<Metadata> => {
  const { domain } = await params;
  const { resolver } = await searchParams;
  const URLsearchParams = new URLSearchParams();
  if (resolver) URLsearchParams.set('resolver', resolver);
  const search = URLsearchParams.size ? `?${URLsearchParams.toString()}` : '';

  return {
    openGraph: {
      url: `/lookup/${domain}/dns${search}`,
    },
    alternates: {
      canonical: `/lookup/${domain}/dns${search}`,
    },
  };
};

const LookupDomain: FC<LookupDomainProps> = async ({
  params: params,
  searchParams: searchParams,
}): Promise<ReactElement> => {
  const { domain } = await params;
  const { resolver: resolverData } = await searchParams;

  const resolver = getResolver(resolverData);

  let records: Record<string, RawRecord[]>;
  let ipsInfo: Record<string, string> = {};
  let resolverError = false;

  try {
    records = await resolver.resolveAllRecords(domain);
    ipsInfo = await getIpsInfo(
      records.A.map((r: RawRecord) => r.data).concat(
        records.AAAA.map((r: RawRecord) => r.data)
      )
    );
  } catch (error) {
    console.error(
      `DNS resolution failed for ${domain} with resolver ${resolverData || 'authoritative'}:`,
      error
    );
    resolverError = true;
    records = {
      A: [],
      AAAA: [],
      CAA: [],
      CNAME: [],
      DNSKEY: [],
      DS: [],
      MX: [],
      NAPTR: [],
      NS: [],
      PTR: [],
      SOA: [],
      SRV: [],
      TXT: [],
    };
  }

  const hasResults =
    Object.values(records)
      .map((r: RawRecord[]) => r.length)
      .reduce((prev: number, curr: number) => prev + curr, 0) > 0;

  if (await isDomainAvailable(domain)) {
    return <DomainNotRegistered />;
  }

  if (resolverError && !hasResults) {
    return (
      <div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <ResolverSelector initialValue={resolverData} />
          </div>
          <div className="flex flex-col gap-2 sm:gap-4 md:flex-row">
            {resolverData === 'google' && <FlushGoogleDnsCacheButton />}
            {resolverData === 'cloudflare' && <FlushCloudflareDnsCacheButton />}
            <DnsHistoryButton domain={domain} />
          </div>
        </div>
        <p className="text-muted-foreground mt-24 text-center">
          DNS resolution failed. Please try with a different resolver or try
          again later.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <ResolverSelector initialValue={resolverData} />
        </div>
        <div className="flex flex-col gap-2 sm:gap-4 md:flex-row">
          {resolverData === 'google' && <FlushGoogleDnsCacheButton />}
          {resolverData === 'cloudflare' && <FlushCloudflareDnsCacheButton />}
          <DnsHistoryButton domain={domain} />
        </div>
      </div>

      {hasResults ? (
        <DnsTable records={records} ipsInfo={ipsInfo} />
      ) : (
        <p className="text-muted-foreground mt-24 text-center">
          No DNS records found!
        </p>
      )}
    </>
  );
};

export default LookupDomain;
