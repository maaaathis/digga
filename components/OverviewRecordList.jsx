'use client';

import { ExternalLinkIcon, InfoIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import reactStringReplace from 'react-string-replace';
import { useDisclosure } from 'react-use-disclosure';

import { TableCell, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import IpDetailsModal from '@/components/IpDetailsModal';
import { RawRecord } from '@/utils/DnsLookup';

const OverviewRecordList = ({ record }) => {
  const [detailedIp, setDetailedIp] = useState(null);
  const { isOpen, open, close } = useDisclosure();

  return (
    <>
      <InfoIcon
        role="button"
        className="mx-1 inline-block h-4 w-4 -translate-y-0.5 cursor-pointer"
        onClick={() => {
          setDetailedIp(record);
          open();
        }}
      />

      <IpDetailsModal ip={detailedIp} isOpen={isOpen} onClose={close} />
    </>
  );
};

export default OverviewRecordList;
