'use client';

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import { MedalIcon } from 'lucide-react';
import { redirect } from 'next/navigation';
import React, { FC, ReactElement } from 'react';

const CreditsInfo: FC = (): ReactElement => {
  return (
    <Popover
      showArrow
      placement="top-end"
      radius="lg"
      classNames={{
        base: 'border border-divider rounded-xl',
        arrow: 'bg-divider',
      }}
    >
      <PopoverTrigger>
        <Button variant="ghost" className="bg-background" disableRipple>
          <MedalIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="rounded-xl bg-background p-3 text-default-500 transition-opacity">
        originally created by{' '}
        <a
          className="decoration-offset-4 hover:underline"
          target="_blank"
          href="https://github.com/wotschofsky"
        >
          Felix Wotschofsky
        </a>
        <br />
        forked by{' '}
        <a
          className="decoration-offset-4 hover:underline"
          target="_blank"
          href="https://github.com/maaaathis"
        >
          maaaathis
        </a>
      </PopoverContent>
    </Popover>
  );
};

export default CreditsInfo;
