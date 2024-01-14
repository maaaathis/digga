'use client';

import { useRouter } from 'next/navigation';
import { FC, ReactElement } from 'react';

import { Button } from '@/components/ui/button';

interface Props {
  domain: string;
}

export const CreateSnapshotCTA: FC<Props> = (domain): ReactElement => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => router.push(`https://web.archive.org/save/${domain}`)}
    >
      Create snapshot
    </Button>
  );
};
