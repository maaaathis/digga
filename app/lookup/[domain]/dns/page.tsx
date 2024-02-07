import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import type { FC, ReactElement } from 'react';
import React from 'react';

import DnsHistoryButton from '@/app/lookup/[domain]/dns/_components/DnsHistoryButton';
import DnsTable from '@/app/lookup/[domain]/dns/_components/DnsTable';
import FlushGoogleDnsCacheButton from '@/app/lookup/[domain]/dns/_components/FlushGoogleDnsCacheButton';
import LocationSelector from '@/app/lookup/[domain]/dns/_components/LocationSelector';
import ResolverSelector from '@/app/lookup/[domain]/dns/_components/ResolverSelector';
import DomainNotRegistered from '@/components/DomainNotRegistered';
import { getIpsInfo } from '@/lib/ips';
import AlibabaDoHResolver from '@/lib/resolvers/AlibabaDoHResolver';
import AuthoritativeResolver from '@/lib/resolvers/AuthoritativeResolver';
import CloudflareDoHResolver from '@/lib/resolvers/CloudflareDoHResolver';
import GoogleDoHResolver from '@/lib/resolvers/GoogleDoHResolver';
import InternalDoHResolver from '@/lib/resolvers/InternalDoHResolver';
import { isDomainAvailable } from '@/lib/whois';

const getResolver = (
  resolverName: string | undefined,
  locationName: string | undefined
) => {
  if (locationName) {
    switch (resolverName) {
      case 'cloudflare':
        return new InternalDoHResolver(locationName, 'cloudflare');
      case 'google':
        return new InternalDoHResolver(locationName, 'google');
      case 'alibaba':
        return new InternalDoHResolver(locationName, 'alibaba');
    }

    throw new Error('Invalid resolver');
  }
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
  params: {
    domain: string;
  };
  searchParams: {
    resolver?: string;
    location?: string;
  };
};

export const fetchCache = 'default-no-store';

export const generateMetadata = ({
  params: { domain },
  searchParams: { resolver, location },
}: LookupDomainProps): Metadata => {
  const params = new URLSearchParams();
  if (resolver) params.set('resolver', resolver);
  if (location) params.set('location', location);
  const search = params.size ? `?${params.toString()}` : '';

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
  params: { domain },
  searchParams: { resolver: resolverName, location: locationName },
}): Promise<ReactElement> => {
  if (locationName && !resolverName) {
    return redirect(
      `/lookup/${encodeURIComponent(domain)}/dns`,
      RedirectType.replace
    );
  }

  const resolver = getResolver(resolverName, locationName);
  const records = await resolver.resolveAllRecords(domain);
  const ipsInfo = await getIpsInfo(
    records.A.map((r) => r.data).concat(records.AAAA.map((r) => r.data))
  );

  const hasResults =
    Object.values(records)
      .map((r) => r.length)
      .reduce((prev, curr) => prev + curr, 0) > 0;

  if (await isDomainAvailable(domain)) {
    return <DomainNotRegistered />;
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <ResolverSelector initialValue={resolverName} />
          <LocationSelector
            initialValue={locationName}
            disabled={!resolverName}
          />
        </div>
        <div className="flex flex-col gap-2 sm:gap-4 md:flex-row">
          {resolverName === 'google' && <FlushGoogleDnsCacheButton />}
          <DnsHistoryButton domain={domain} />
        </div>
      </div>

      {hasResults ? (
        <DnsTable records={records} ipsInfo={ipsInfo} />
      ) : (
        <p className="mt-24 text-center text-muted-foreground">
          No DNS records found!
        </p>
      )}
    </>
  );
};

export default LookupDomain;
