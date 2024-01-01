'use client';

import { type FC, ReactElement, useEffect } from 'react';

type ArchiveErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ArchiveError: FC<ArchiveErrorProps> = ({ error }): ReactElement => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mt-12 flex flex-col items-center gap-2">
      <h2>Something went wrong!</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Digest: {error.digest}
      </p>
    </div>
  );
};
export default ArchiveError;
