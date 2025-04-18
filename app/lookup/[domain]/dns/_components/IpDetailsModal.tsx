import type { DialogProps } from '@radix-ui/react-dialog';
import { useWindowSize } from '@uidotdev/usehooks';
import naturalCompare from 'natural-compare-lite';
import { type FC } from 'react';
import useSWRImmutable from 'swr/immutable';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

import type { IpLookupResponse } from '@/app/api/lookup-ip/route';
import CopyButton from '@/components/CopyButton';
import DomainLink from '@/components/DomainLink';

enum EntryTypes {
  IP,
  Reverse,
  Organization,
  ISP,
  Location,
  Coordinates,
  Timezone,
}

type IpDetailsModalProps = {
  ip: string;
  open: DialogProps['open'];
  onOpenChange: DialogProps['onOpenChange'];
};

const IpDetailsModal: FC<IpDetailsModalProps> = ({
  ip,
  open,
  onOpenChange,
}) => {
  const { width: windowWidth } = useWindowSize();

  const { data, error } = useSWRImmutable<IpLookupResponse>(
    open ? `/api/lookup-ip?ip=${encodeURIComponent(ip)}` : null
  );

  let mappedEntries: { label: string; value: string; type: EntryTypes }[] = [];

  if (data) {
    mappedEntries = [
      {
        type: EntryTypes.IP,
        label: 'IP',
        value: ip,
      },
      ...data.reverse
        .slice()
        .sort(naturalCompare)
        .map((address) => ({
          type: EntryTypes.Reverse,
          label: 'Reverse',
          value: address,
        })),
      {
        type: EntryTypes.Organization,
        label: 'Organization',
        value: data.org,
      },
      {
        type: EntryTypes.ISP,
        label: 'ISP',
        value: data.isp,
      },
      {
        type: EntryTypes.Location,
        label: 'Location',
        value: `${data.country}, ${data.region}, ${data.city}`,
      },
      {
        type: EntryTypes.Timezone,
        label: 'Timezone',
        value: data.timezone,
      },
    ];
  }

  const title = `IP Details for ${ip}`;
  const content = error ? (
    <p className="my-12 text-center">An error occurred!</p>
  ) : !data ? (
    <div className="flex items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <Table>
      <TableBody>
        {mappedEntries.map((el) => (
          <TableRow key={el.label + el.value} className="hover:bg-transparent">
            <TableCell className="pl-0">{el.label}</TableCell>
            <TableCell className="pr-0">
              {el.type === EntryTypes.Reverse ? (
                <DomainLink domain={el.value} />
              ) : (
                <>
                  <span>{el.value}</span>
                  {el.type === EntryTypes.IP && <CopyButton value={el.value} />}
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (windowWidth && windowWidth < 640) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default IpDetailsModal;
