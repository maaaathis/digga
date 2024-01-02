'use client';

import { DateTime } from 'luxon';
import Link from 'next/link';
import { type FC, ReactElement, useEffect, useState } from 'react';
import Iframe from 'react-iframe';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';

import WebArchiveIframeDrawer from '@/app/lookup/[domain]/archive/_components/WebArchiveIframeDrawer';

type WebArchiveItemProps = {
  url: string;
  timestamp: string;
};

const WebArchiveItem: FC<WebArchiveItemProps> = ({
  url,
  timestamp,
}): ReactElement => {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  return (
    <div className="col-span-1 flex flex-col gap-4 rounded-xl border p-3">
      <Iframe
        url={url}
        className="h-48 w-full overflow-hidden rounded-lg"
        styles={{ display: isIframeLoaded ? 'block' : 'none' }}
        scrolling="no"
        onLoad={() => {
          setIsIframeLoaded(true);
        }}
      />
      {!isIframeLoaded && <Skeleton className="h-48 w-full rounded-lg" />}
      <div className="flex flex-row justify-between">
        <span className="text-sm">
          {DateTime.fromFormat(timestamp, 'yyyyMMddHHmmss').toFormat(
            'MM/dd/yyyy mm:ss tt'
          )}
        </span>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="sm">
              Open
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-5/6">
            <WebArchiveIframeDrawer url={url} timestamp={timestamp} />
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default WebArchiveItem;
