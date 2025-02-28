'use client';

import { XSquareIcon } from 'lucide-react';
import { FC, ReactElement } from 'react';

const DomainNotRegistered: FC = (): ReactElement => (
  <div className="mt-12 flex flex-col items-center gap-2">
    <XSquareIcon className="h-16 w-16" />
    <h2 className="mt-4 text-2xl font-bold">
      This Domain is currently not registered!
    </h2>
    <p className="text-muted-foreground mt-2 text-center text-lg">
      Please try again with a different domain.
    </p>
  </div>
);

export default DomainNotRegistered;
