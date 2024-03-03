'use client';

import { type FC, ReactElement, useEffect } from 'react';

import ErrorView from '@/components/ErrorView';

type DomainErrorProps = {
  error: Error & { digest?: string };
};

const DomainError: FC<DomainErrorProps> = ({ error }): ReactElement => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView digest={error.digest} />;
};

export default DomainError;
