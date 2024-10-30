'use client';

import { InfoIcon } from 'lucide-react';
import { type FC, ReactElement, useCallback, useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import IpDetailsModal from '@/app/lookup/[domain]/dns/_components/IpDetailsModal';

type IpLinkProps = {
  value: string;
};

const IpLink: FC<IpLinkProps> = ({ value }): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            asChild
            onClick={open}
            data-umami-event="modal-iplink"
          >
            <a className="cursor-pointer select-none underline decoration-dotted underline-offset-4 hover:decoration-dashed">
              <span className="select-none">{value}</span>
              <InfoIcon
                role="button"
                className="mx-1 inline-block h-3 w-3 -translate-y-0.5"
              />
            </a>
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

export default IpLink;
