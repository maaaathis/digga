'use client';

import { DateTime } from 'luxon';
import { type FC, ReactElement, useEffect } from 'react';
import Iframe from 'react-iframe';

import { Button } from '@/components/ui/button';

type WebArchiveItemProps = {
  url: string;
  timestamp: string;
};

const WebArchiveItem: FC<WebArchiveItemProps> = async ({
  url,
  timestamp,
}): Promise<ReactElement> => {
  console.log(DateTime.fromFormat(timestamp, 'yyyyMMddHHmmss'));

  return (
    <div className="col-span-1 flex flex-col gap-4 rounded-xl border p-3">
      <Iframe
        url={`https://web.archive.org/web/20231220211300/https://www.lostify.net/`}
        className="w-full overflow-hidden rounded-lg"
        scrolling="no"
      />
      <div className="flex flex-row justify-between">
        <span className="text-sm">
          {DateTime.fromFormat(timestamp, 'yyyyMMddHHmmss').toFormat(
            'MM/dd/yyyy mm:ss tt'
          )}
        </span>
        <Button variant="ghost" size="sm">
          Open
        </Button>
      </div>
    </div>
  );
};

export default WebArchiveItem;
