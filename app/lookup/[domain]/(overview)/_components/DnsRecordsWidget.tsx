import { Dot, XSquareIcon } from 'lucide-react';
import React, { use } from 'react';

import DashboardItem from '@/app/lookup/[domain]/(overview)/_components/DashboardItem';
import IpOverviewItem from '@/app/lookup/[domain]/(overview)/_components/IpOverviewItem';
import { getIpsInfo } from '@/lib/ips';
import { ALL_RECORD_TYPES } from '@/lib/resolvers/base';
import { getResolverFromName } from '@/lib/resolvers/utils';
import { cutLastDot } from '@/lib/utils';

export enum DnsRecordType {
  A = 'A',
  AAAA = 'AAAA',
  CAA = 'CAA',
  CNAME = 'CNAME',
  DNSKEY = 'DNSKEY',
  DS = 'DS',
  MX = 'MX',
  NAPTR = 'NAPTR',
  NS = 'NS',
  PTR = 'PTR',
  SOA = 'SOA',
  SRV = 'SRV',
  TXT = 'TXT',
}

interface DnsRecordsWidgetProps {
  type: DnsRecordType;
  domain: string;
}

async function fetchRecords(domain: string, type: DnsRecordType) {
  const resolver = getResolverFromName('cloudflare');
  return await resolver.resolveRecordType(domain, type);
}

const DnsRecordsWidget: React.FC<DnsRecordsWidgetProps> = ({
  type,
  domain,
}): React.ReactElement => {
  const records = use(fetchRecords(domain, type));
  const ipsInfo = use(
    getIpsInfo(
      records
        .filter((record) => record.type === 'A' || record.type === 'AAAA')
        .map((record) => record.data)
    )
  );

  return (
    <DashboardItem title={type + '-Records'}>
      <div className="flex h-full">
        {Object.values(records).length === 0 ? (
          <div className="m-auto">
            <XSquareIcon className="h-10 w-10 text-black dark:text-white" />
          </div>
        ) : (
          <ul className="flex flex-col gap-2 text-lg font-medium text-slate-900 dark:text-slate-100">
            {Object.values(records).map((record) => {
              return (
                <li key={record.data.split(' ')[1]}>
                  {type == 'MX' ? (
                    <a
                      className="flex cursor-pointer select-none flex-row gap-2 decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:decoration-slate-300"
                      href={`/lookup/${cutLastDot(record.data.split(' ')[1])}`}
                      rel="nofollow"
                    >
                      <Dot className="my-auto h-7 w-7 shrink-0" />
                      <span>{cutLastDot(record.data.split(' ')[1])}</span>
                    </a>
                  ) : (
                    <IpOverviewItem
                      value={record.data}
                      subvalue={ipsInfo[record.data]}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardItem>
  );
};

export default DnsRecordsWidget;
