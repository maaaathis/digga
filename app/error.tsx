'use client';

import { Bug } from 'lucide-react';
import { type FC, useEffect } from 'react';

import StyledError from '@/components/StyledError';

type GlobalErrorProps = {
  error: Error & { digest?: string };
};

const GlobalError: FC<GlobalErrorProps> = ({ error }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="my-16 flex h-full w-full">
      <div className="m-auto flex flex-col items-center gap-2">
        <StyledError
          title="An system error occurred."
          description={`Digest: ${error.digest}`}
          icon={<Bug className="h-16 w-16" />}
        />
      </div>
    </div>
  );
};

export default GlobalError;
