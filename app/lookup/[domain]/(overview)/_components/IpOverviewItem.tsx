'use client';

import { Dot } from 'lucide-react';
import { type FC, ReactElement, useCallback, useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import IpDetailsModal from '@/app/lookup/[domain]/dns/_components/IpDetailsModal';

type IpOverviewItemProps = {
  value: string;
  subvalue?: string;
};

const IpOverviewItem: FC<IpOverviewItemProps> = ({
  value,
  subvalue,
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            asChild
            onClick={open}
            data-umami-event="modal-ipoverview"
          >
            <div className="flex cursor-pointer select-none flex-row gap-2 rounded-lg p-2 px-2.5 pr-3 hover:bg-accent">
              <Dot className="my-auto inline-block h-7 w-7 shrink-0" />
              <div className="flex flex-col">
                <span className="select-none">{value}</span>
                {subvalue && (
                  <span className="block select-none text-xs text-muted-foreground">
                    {subvalue}
                  </span>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>View IP Info</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <IpDetailsModal ip={value} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default IpOverviewItem;
