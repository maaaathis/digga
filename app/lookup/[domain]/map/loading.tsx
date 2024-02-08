'use client';

import { FC, ReactElement } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const DnsMapLoading: FC = (): ReactElement => (
  <div className="flex flex-col gap-8 lg:flex-row">
    <div className="flex h-full basis-2/5">
      <div className="my-auto grid grid-cols-2 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
    <div className="order-first basis-3/5 lg:order-last">
      <div className="mt-12 flex justify-center">
        <Skeleton className="my-36 aspect-square w-3/5 rounded-full" />
      </div>
    </div>
  </div>
);

export default DnsMapLoading;
