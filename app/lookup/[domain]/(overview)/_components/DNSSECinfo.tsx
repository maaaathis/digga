'use client';

import { ShieldBan, ShieldCheck } from 'lucide-react';
import type { FC } from 'react';
import useSWRImmutable from 'swr/immutable';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { WhoisDataResponse } from '@/app/api/internal/whois/route';

type DNSSECinfoProps = {
  domain: string;
};

const DNSSECinfo: FC<DNSSECinfoProps> = ({ domain }) => {
  const { data, isLoading } = useSWRImmutable<WhoisDataResponse>(
    `/api/internal/whois/?domain=${domain}`
  );

  return (
    <div className="my-auto">
      {isLoading ? (
        <Skeleton className="h-5 w-28 rounded-sm" />
      ) : (
        <>
          {data?.isDNSSECSigned ? (
            <Badge
              className="px-1 text-xs font-light"
              color="green"
              variant="outline"
            >
              <ShieldCheck className="mr-1 inline-block h-3 w-3 text-green-500" />
              DNSSEC signed
            </Badge>
          ) : (
            <Badge
              className="px-1 text-xs  font-light"
              color="red"
              variant="outline"
            >
              <ShieldBan className="mr-1 inline-block h-3 w-3 text-red-500" />
              DNSSEC unsigned
            </Badge>
          )}
        </>
      )}
    </div>
  );
};

export default DNSSECinfo;
