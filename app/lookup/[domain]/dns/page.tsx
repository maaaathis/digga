import type { FC, ReactElement } from 'react';
import React from 'react';

import DnsTable from '@/components/DnsTable';
import DomainNotRegistered from '@/components/DomainNotRegistered';
import { DomainAvailability, isAvailable } from '@/lib/whois';
import DnsLookup from '@/utils/DnsLookup';

type LookupDomainProps = {
  params: {
    domain: string;
  };
};

export const fetchCache = 'default-no-store';

const LookupDomain: FC<LookupDomainProps> = async ({
  params: { domain },
}): Promise<ReactElement> => {
  const lookup = new DnsLookup();
  const records = await lookup.resolveAllRecords(domain);

  if ((await isAvailable(domain)) != DomainAvailability.REGISTERED) {
    return <DomainNotRegistered />;
  }

  return (
    <>
      {Object.values(records)
        .map((r) => r.length)
        .reduce((prev, curr) => prev + curr, 0) === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No DNS records found!
        </p>
      ) : (
        <DnsTable records={records} />
      )}
    </>
  );
};

export default LookupDomain;
