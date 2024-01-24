'use client';

import { Dot, DotSquare, InfoIcon } from 'lucide-react';
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
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), [setOpen]);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild onClick={open}>
            <div className="flex cursor-pointer select-none flex-row gap-2 rounded-lg p-1.5 px-2.5 hover:bg-accent">
              <Dot className="my-auto inline-block h-6 w-6" />
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

      <IpDetailsModal ip={value} open={isOpen} onOpenChange={setOpen} />
    </>
  );
};

export default IpOverviewItem;
