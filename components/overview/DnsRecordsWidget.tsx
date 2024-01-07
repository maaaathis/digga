import { XSquareIcon } from 'lucide-react';
import React, { FC, use } from 'react';

import DashboardItem from '@/components/overview/DashboardItem';
import DnsLookup from '@/utils/AuthoritativeResolver';

import RecordList from './RecordList';

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
  const lookup = new DnsLookup();

  return await lookup.fetchRecords(domain, type);
}

const DnsRecordsWidget: React.FC<DnsRecordsWidgetProps> = ({
  type,
  domain,
}): React.ReactElement => {
  const records = use(fetchRecords(domain, type));

  return (
    <DashboardItem title={type + '-Records'}>
      <div className="flex h-full">
        {Object.values(records).length === 0 ? (
          <div className="m-auto">
            <XSquareIcon className="h-10 w-10 text-black dark:text-white" />
          </div>
        ) : (
          <ul className="list-inside list-disc text-lg font-medium text-slate-900 dark:text-slate-100">
            {Object.values(records).map((record) => {
              return (
                <li key={record.data.split(' ')[1]}>
                  {type == 'MX' ? (
                    <a
                      className="cursor-pointer select-none decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:decoration-slate-300"
                      href={`/lookup/${record.data.split(' ')[1]}`}
                    >
                      {record.data.split(' ')[1]}
                    </a>
                  ) : (
                    <RecordList record={record.data} />
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
