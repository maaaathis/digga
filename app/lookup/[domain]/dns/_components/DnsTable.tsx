'use client';

import naturalCompare from 'natural-compare-lite';
import { type FC, Fragment, ReactElement } from 'react';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import RecordRow from '@/app/lookup/[domain]/dns/_components/RecordRow';
import StackedRecord from '@/app/lookup/[domain]/dns/_components/StackedRecord';
import type { ResolvedRecords } from '@/lib/resolvers/DnsResolver';

type DnsTableProps = {
  records: ResolvedRecords;
  ipsInfo: Record<string, string>;
};

const DnsTable: FC<DnsTableProps> = ({ records, ipsInfo }): ReactElement => (
  <>
    {Object.keys(records).map((recordType) => {
      const value = records[recordType];

      if (!value || value.length === 0) {
        return;
      }

      return (
        <Fragment key={recordType}>
          <h2 className="mt-8 mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
            {recordType}
          </h2>

          <div className="flex flex-col gap-4 sm:hidden">
            {value
              .slice()
              .sort((a, b) => naturalCompare(a.data, b.data))
              .map((v, i) => (
                <Fragment key={v.type + v.data}>
                  {i > 0 && <hr />}
                  <StackedRecord
                    name={v.name}
                    TTL={v.TTL}
                    value={v.data}
                    subvalue={ipsInfo[v.data]}
                  />
                </Fragment>
              ))}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <Table key={recordType}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0">Name</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead className="pr-0">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {value
                  .slice()
                  .sort((a, b) => naturalCompare(a.data, b.data))
                  .map((v) => (
                    <RecordRow
                      key={v.type + v.data}
                      name={v.name}
                      TTL={v.TTL}
                      value={v.data}
                      subvalue={ipsInfo[v.data]}
                    />
                  ))}
              </TableBody>
            </Table>
          </div>
        </Fragment>
      );
    })}
  </>
);

export default DnsTable;
