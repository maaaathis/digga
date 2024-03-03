'use client';

import { type FC, ReactElement, useEffect } from 'react';

import ErrorView from '@/components/ErrorView';

type WhoisErrorProps = {
  error: Error & { digest?: string };
};

const WhoisError: FC<WhoisErrorProps> = ({ error }): ReactElement => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView digest={error.digest} />;
};
export default WhoisError;
