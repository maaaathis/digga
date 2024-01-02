import { FC, ReactElement } from 'react';
import whoiser from 'whoiser';

import TechnologiesWidget from '@/components/overview/TechnologiesWidget';
import { DomainAvailability, isAvailable } from '@/lib/whois';

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
  // @ts-ignore
  const whoisResult = whoiser.firstResult(
    await whoiser(domain, {
      timeout: 3000,
    })
  );

  if ((await isAvailable(domain)) !== DomainAvailability.REGISTERED) {
    return <DomainNotRegistered />;
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        <DomainDatesWidget domain={domain} />
        <DomainOwnerInfoWidget domain={domain} />
        <DnsRecordsWidget type={DnsRecordType.A} domain={domain} />
        <NameserverWidget domain={domain} />
        <DnsRecordsWidget type={DnsRecordType.MX} domain={domain} />
        <DomainlabelWidget domain={domain} />
        <TechnologiesWidget domain={domain} />
      </div>
    </>
  );
};

export default LookupDomain;
