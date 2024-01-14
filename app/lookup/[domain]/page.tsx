import { FC, ReactElement } from 'react';
import whoiser from 'whoiser';

import TechnologiesWidget from '@/components/overview/TechnologiesWidget';
import { getBaseDomain } from '@/lib/utils';
import { isDomainAvailable } from '@/lib/whois';

import DomainNotRegistered from '../../../components/DomainNotRegistered';
import DnsRecordsWidget, {
  DnsRecordType,
} from '../../../components/overview/DnsRecordsWidget';
import DomainDatesWidget from '../../../components/overview/DomainDatesWidget';
import DomainlabelWidget from '../../../components/overview/DomainlabelWidget';
import DomainOwnerInfoWidget from '../../../components/overview/DomainOwnerInfoWidget';
import NameserverWidget from '../../../components/overview/NameserverWidget';

export const fetchCache = 'default-no-store';

interface LookupDomainProps {
  params: {
    domain: string;
  };
}

const LookupDomain: FC<LookupDomainProps> = async ({
  params: { domain },
}): Promise<ReactElement> => {
  const baseDomain = getBaseDomain(domain);

  let whoisResult;
  try {
    // @ts-ignore
    whoisResult = whoiser.firstResult(
      await whoiser(baseDomain, {
        timeout: 3000,
      })
    );
  } catch (error) {
    console.error('Error fetching whois data:', error);
  }

  if (await isDomainAvailable(baseDomain)) {
    return <DomainNotRegistered />;
  }

  whoisResult = false;

  return (
    <>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {whoisResult && (
          <>
            <DomainDatesWidget whoisData={whoisResult} />
            <DomainOwnerInfoWidget whoisData={whoisResult} />
          </>
        )}
        <DnsRecordsWidget type={DnsRecordType.A} domain={domain} />
        {whoisResult && (
          <NameserverWidget whoisData={whoisResult} domain={domain} />
        )}
        <DnsRecordsWidget type={DnsRecordType.MX} domain={domain} />
        {whoisResult && <DomainlabelWidget whoisData={whoisResult} />}
        <TechnologiesWidget domain={domain} />
      </div>
    </>
  );
};

export default LookupDomain;
