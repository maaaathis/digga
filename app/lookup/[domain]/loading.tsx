import React, { type FC, ReactElement } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const OverviewLoader: FC = (): ReactElement => (
  <div className="flex flex-col gap-4 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton className="col-span-2 h-56 w-full rounded-xl" key={i} />
    ))}
  </div>
);

export default OverviewLoader;
