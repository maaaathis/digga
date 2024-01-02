'use client';

import type { DialogProps } from '@radix-ui/react-dialog';
import type { LatLngExpression } from 'leaflet';
import { LeafIcon } from 'lucide-react';
import naturalCompare from 'natural-compare-lite';
import dynamic from 'next/dynamic';
import { type FC, ReactElement } from 'react';
import useSWR from 'swr';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

import type { IpLookupResponse } from '@/app/api/lookupIp/route';
import CopyButton from '@/components/CopyButton';
import DomainLink from '@/components/DomainLink';
import { useMediaQuery } from '@/hooks/use-media-query';

const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
});

enum EntryTypes {
  IP,
  Reverse,
  Organization,
  ISP,
  Location,
  Coordinates,
  Timezone,
}

type IpDetailsContentProps = {
  ip: string;
  data: IpLookupResponse | undefined;
  error: string;
};

const IpDetailsContent: FC<IpDetailsContentProps> = ({ ip, data, error }) => {
  let mappedEntries: { label: string; value: string; type: EntryTypes }[] = [];
  let location: LatLngExpression = [0, 0];

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
        type: EntryTypes.Coordinates,
        label: 'Coordinates',
        value: `Latitude: ${data.lat}; Longitude: ${data.lon}`,
      },
      {
        type: EntryTypes.Timezone,
        label: 'Timezone',
        value: data.timezone,
      },
    ];

    location = [data.lat, data.lon];
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p>An error occurred!</p>;
  }

  return (
    <>
      <Table>
        <TableBody>
          {mappedEntries.map((el) => (
            <TableRow
              key={el.label + el.value}
              className="hover:bg-transparent"
            >
              <TableCell className="pl-0">{el.label}</TableCell>
              <TableCell className="pr-0">
                {el.type === EntryTypes.Reverse ? (
                  <DomainLink domain={el.value} />
                ) : (
                  <>
                    <span>{el.value}</span>
                    {el.type === EntryTypes.IP && (
                      <CopyButton value={el.value} />
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="my-4 [&_.leaflet-container]:h-48 [&_.leaflet-container]:w-full">
        <LocationMap location={location} />
      </div>
    </>
  );
};

type IpDetailsModalProps = {
  ip: string;
  open: DialogProps['open'];
  onOpenChange: DialogProps['onOpenChange'];
};

const IpDetailsModal: FC<IpDetailsModalProps> = ({
  ip,
  open,
  onOpenChange,
}): ReactElement => {
  const { data, error } = useSWR<IpLookupResponse>(
    open ? `/api/lookupIp?ip=${encodeURIComponent(ip)}` : null
  );
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog modal open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              IP Details for{' '}
              <span className="font-extrabold tracking-wider">{ip}</span>
              {data && data.greenHosted && (
                <Badge variant="outline" className="ml-2">
                  <LeafIcon className="mr-1 inline-block h-3 w-3 text-green-500" />
                  Green hosted
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              <IpDetailsContent data={data} ip={ip} error={error} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>
            IP Details for{' '}
            <span className="font-extrabold tracking-wider">{ip}</span>
            {data && data.greenHosted && (
              <Badge variant="outline" className="ml-2">
                <LeafIcon className="mr-1 inline-block h-3 w-3 text-green-500" />
                Green hosted
              </Badge>
            )}
          </DrawerTitle>
          <DrawerDescription>
            <IpDetailsContent data={data} ip={ip} error={error} />
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default IpDetailsModal;
