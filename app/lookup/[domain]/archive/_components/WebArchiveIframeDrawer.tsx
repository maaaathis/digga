'use client';

import { ShieldHalf } from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { type FC, ReactElement, useState } from 'react';
import Iframe from 'react-iframe';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';

type WebArchiveIframeDrawerProps = {
  url: string;
  timestamp: string;
};

const WebArchiveIframeDrawer: FC<WebArchiveIframeDrawerProps> = ({
  url,
  timestamp,
}): ReactElement => {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          <span className="font-extrabold">WebArchive:</span>{' '}
          {DateTime.fromFormat(timestamp, 'yyyyMMddHHmmss').toFormat(
            'MM/dd/yyyy tt'
          )}
        </DrawerTitle>
        <DrawerDescription>
          <span>{url}</span>
          <Badge variant="outline" className="ml-2">
            <ShieldHalf className="mr-1 inline-block h-3 w-3" />
            Secure
          </Badge>
        </DrawerDescription>
      </DrawerHeader>
      <div className="h-full p-4 pb-0">
        <Iframe
          url={url}
          className="h-full w-full overflow-hidden rounded-lg"
          styles={{ display: isIframeLoaded ? 'block' : 'none' }}
          onLoad={() => {
            setIsIframeLoaded(true);
          }}
        />
        {!isIframeLoaded && (
          <Skeleton className="flex h-full w-full items-center justify-center rounded-lg">
            <span className="flex flex-col text-center text-gray-900 dark:text-gray-200">
              <span>Please wait</span>
              <span>This could take a while ...</span>
            </span>
          </Skeleton>
        )}
      </div>
      <DrawerFooter className="flex w-full flex-row">
        <DrawerClose className="w-full" asChild>
          <Button variant="outline">Close</Button>
        </DrawerClose>
        <Link
          href={url}
          target="_blank"
          rel="noopener noreffrer"
          className="w-full lg:w-3/6"
        >
          <Button className="w-full">Open in WebArchive</Button>
        </Link>
      </DrawerFooter>
    </>
  );
};

export default WebArchiveIframeDrawer;
