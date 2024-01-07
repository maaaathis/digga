import { FC, ReactElement } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const DnsMapLoading: FC = (): ReactElement => (
  <div className="mt-12 flex justify-center">
    <Skeleton className="my-36 aspect-square w-3/5 rounded-full" />
  </div>
);

export default DnsMapLoading;
