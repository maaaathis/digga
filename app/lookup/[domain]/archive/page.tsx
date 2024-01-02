'use client';

import { redirect, useRouter } from 'next/navigation';
import { type FC, Fragment, ReactElement, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

import WebArchiveItem from '@/app/lookup/[domain]/archive/_components/WebArchiveItem';

type ArchivePageProps = {
  params: {
    domain: string;
  };
};

const ArchivePage: FC<ArchivePageProps> = ({
  params: { domain },
}): ReactElement => {
  const router = useRouter();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => router.push(`https://web.archive.org/save/${domain}`)}
      >
        Create snapshot
      </Button>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <WebArchiveItem
          url={
            'https://web.archive.org/web/20231220211300/https://www.lostify.net/'
          }
          timestamp="20231220211300"
        />
      </div>
    </>
  );
};

export default ArchivePage;
