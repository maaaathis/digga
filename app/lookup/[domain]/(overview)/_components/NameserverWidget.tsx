import { Dot } from 'lucide-react';
import React, { use } from 'react';

import { DnsRecordType } from '@/app/lookup/[domain]/(overview)/_components/DnsRecordsWidget';
import DNSSECinfo from '@/app/lookup/[domain]/(overview)/_components/DNSSECinfo';
import { getResolverFromName } from '@/lib/resolvers/utils';
import { cutLastDot } from '@/lib/utils';

import DashboardItem from './DashboardItem';

interface Props {
  // whoiser doesn't have a proper type definition :c
  whoisData: any;
  domain: string;
}

async function fetchRecords(domain: string, type: DnsRecordType) {
  const resolver = getResolverFromName('cloudflare');
  return await resolver.resolveRecordType(domain, type);
}

const NameserverWidget: React.FC<Props> = ({
  whoisData,
  domain,
}): React.ReactElement | null => {
  const records = use(fetchRecords(domain, DnsRecordType.NS));

  const nameserversByWhois =
    whoisData['Name Server'] &&
    Object.values(whoisData['Name Server']).filter(Boolean);

  if (
    !nameserversByWhois &&
    (!records || Object.values(records).length === 0)
  ) {
    return null;
  }

  const nsList =
    nameserversByWhois && nameserversByWhois.length > 0
      ? Object.values(nameserversByWhois).map((ns) => ns as string)
      : Object.values(records).map((record) => record.data);

  return (
    <DashboardItem
      title="Nameserver"
      secondaryElement={<DNSSECinfo domain={domain} />}
    >
      <div className="flex h-full">
        <ul className="text-lg font-medium text-slate-900 dark:text-slate-100">
          {nsList.map((ns) => (
            <li key={ns}>
              <a
                className="flex cursor-pointer select-none flex-row gap-2 decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:decoration-slate-300"
                href={`/lookup/${cutLastDot(ns)}`}
                rel="nofollow"
              >
                <Dot className="my-auto h-7 w-7 shrink-0" />
                <span>{cutLastDot(ns)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </DashboardItem>
  );
};

export default NameserverWidget;
