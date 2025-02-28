'use client';

import { ServerCrash } from 'lucide-react';
import { FC, ReactElement } from 'react';

interface ErrorViewProps {
  digest?: string;
}

export const ErrorView: FC<ErrorViewProps> = ({ digest }): ReactElement => (
  <div className="mt-12 flex flex-col items-center gap-2">
    <ServerCrash className="h-12 w-12" />
    <h2 className="font-clash mt-1 text-center text-3xl font-bold tracking-wide">
      Something went wrong!
    </h2>
    {digest && (
      <p className="text-muted-foreground mt-1 text-center text-sm">
        Digest: {digest}
      </p>
    )}
  </div>
);

export default ErrorView;
