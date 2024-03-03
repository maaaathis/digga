'use client';

import { ServerCrash } from 'lucide-react';
import { type FC, ReactElement, useEffect } from 'react';

type WhoisErrorProps = {
  error: Error & { digest?: string };
};

const WhoisError: FC<WhoisErrorProps> = ({ error }): ReactElement => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mt-12 flex flex-col items-center gap-2">
      <ServerCrash className="h-12 w-12" />
      <h2 className="mt-1 text-center font-clash text-3xl font-bold tracking-wide">
        Something went wrong!
      </h2>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Digest: {error.digest}
      </p>
    </div>
  );
};
export default WhoisError;
