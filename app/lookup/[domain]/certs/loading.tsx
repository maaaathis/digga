import { FC, ReactElement } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const CertsLoading: FC = (): ReactElement => (
  <div className="mt-12">
    {Array.from({ length: 10 }).map((_, i) => (
      <Skeleton className="my-3 h-5 w-full rounded-sm" key={i} />
    ))}
  </div>
);

export default CertsLoading;