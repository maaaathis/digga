'use client';

import { FC, ReactElement } from 'react';

import { Spinner } from '@/components/ui/spinner';

const Loader: FC = (): ReactElement => (
  <div className="flex items-center justify-center">
    <Spinner className="my-8" />
  </div>
);

export default Loader;
