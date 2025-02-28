import { FC, ReactElement } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const WhoisLoading: FC = (): ReactElement => (
  <div className="mt-12">
    <Skeleton className="mt-8 mb-4 h-9 w-48 rounded-sm" />
    {Array.from({ length: 10 }).map((_, i) => (
      <Skeleton className="my-3 h-5 w-full rounded-sm" key={i} />
    ))}
  </div>
);

export default WhoisLoading;
