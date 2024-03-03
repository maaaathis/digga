'use client';

import { type FC, ReactElement, useEffect } from 'react';

import ErrorView from '@/components/ErrorView';

type CertsErrorProps = {
  error: Error & { digest?: string };
};

const CertsError: FC<CertsErrorProps> = ({ error }): ReactElement => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView digest={error.digest} />;
};

export default CertsError;
