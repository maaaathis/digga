import { Loader } from 'lucide-react';
import React, { Suspense } from 'react';

import { Card } from '@/components/ui/card';

import { cn } from '@/lib/utils';

interface Props {
  title: string;
  className?: string;
  secondaryElement?: React.ReactNode;
  children: React.ReactNode;
}

const DashboardItem: React.FC<Props> = ({
  title,
  className,
  secondaryElement,
  children,
}): React.ReactElement => {
  return (
    <Card
      className={cn(
        'col-span-2 flex flex-col justify-around gap-4 rounded-xl border-2 px-8 py-5 text-white',
        className
      )}
    >
      <div className="flex flex-col justify-between gap-1 xxs:flex-row">
        <span className="rounded-lg bg-slate-200 px-2 py-1 text-sm font-extrabold uppercase text-slate-950 dark:bg-secondary dark:text-slate-50">
          {title}
        </span>
        {secondaryElement}
      </div>
      <Suspense fallback={<Loader />}>{children}</Suspense>
    </Card>
  );
};

export default DashboardItem;
