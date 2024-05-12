import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import React, { FC, ReactElement } from 'react';

import DnsHistoryButton from '@/app/lookup/[domain]/dns/_components/DnsHistoryButton';
import DnsTable from '@/app/lookup/[domain]/dns/_components/DnsTable';
import FlushCloudflareDnsCacheButton from '@/app/lookup/[domain]/dns/_components/FlushCloudflareDnsCacheButton';
import FlushGoogleDnsCacheButton from '@/app/lookup/[domain]/dns/_components/FlushGoogleDnsCacheButton';
import LocationSelector from '@/app/lookup/[domain]/dns/_components/LocationSelector';
import ResolverSelector from '@/app/lookup/[domain]/dns/_components/ResolverSelector';
import DomainNotRegistered from '@/components/DomainNotRegistered';
import { getIpsInfo } from '@/lib/ips';
import { ALL_RECORD_TYPES } from '@/lib/resolvers/base';
import { getResolverFromName } from '@/lib/resolvers/utils';
import { isDomainAvailable } from '@/lib/whois';

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

  const resolver = getResolverFromName(resolverName, locationName);
  const records = await resolver.resolveRecordTypes(domain, ALL_RECORD_TYPES);
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
          {resolverName === 'cloudflare' && <FlushCloudflareDnsCacheButton />}
          <DnsHistoryButton domain={domain} />
        </div>
      </div>

      {hasResults ? (
        <>
          {/* <GeoDnsCheck domain={domain} /> */
          /* TODO: re-add when more optimised */}
          <DnsTable records={records} ipsInfo={ipsInfo} />
        </>
      ) : (
        <p className="mt-24 text-center text-muted-foreground">
          No DNS records found!
        </p>
      )}
    </>
  );
};

export default LookupDomain;
