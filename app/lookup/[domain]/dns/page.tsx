import { redirect, RedirectType } from 'next/navigation';
import type { FC, ReactElement } from 'react';
import React from 'react';

import DnsTable from '@/components/DnsTable';
import DomainNotRegistered from '@/components/DomainNotRegistered';
import LocationSelector from '@/components/LocationSelector';
import ResolverSelector from '@/components/ResolverSelector';
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

  const hasResults =
    Object.values(records)
      .map((r) => r.length)
      .reduce((prev, curr) => prev + curr, 0) > 0;

  if (await isDomainAvailable(domain)) {
    return <DomainNotRegistered />;
  }

  return (
    <>
      <div className="flex flex-col gap-8 sm:flex-row">
        <ResolverSelector initialValue={resolverName} />
        <LocationSelector
          initialValue={locationName}
          disabled={!resolverName}
        />
      </div>

      {hasResults ? (
        <DnsTable records={records} />
      ) : (
        <p className="mt-24 text-center text-muted-foreground">
          No DNS records found!
        </p>
      )}
    </>
  );
};

export default LookupDomain;
