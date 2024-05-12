'use client';

import { GalleryVerticalEndIcon, LayoutGridIcon } from 'lucide-react';
import Link from 'next/link';
import { FC, use } from 'react';
import useSWRImmutable from 'swr/immutable';

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

import { SubdomainsResponse } from '@/app/api/internal/subdomains/route';

interface SubdomainsRowProps {
  domain: string;
}

const SubdomainsRow: FC<SubdomainsRowProps> = ({ domain }) => {
  const {
    data: results,
    error,
    isLoading,
  } = useSWRImmutable<SubdomainsResponse>(
    `/api/internal/subdomains?domain=${encodeURIComponent(domain)}`
  );

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!results || results.results.length === 0) {
    return <></>;
  }

  return (
    <div className="flex gap-4">
      <>
        {results.results.map((result) => (
          <Button
            key={result.domain}
            asChild
            variant="secondary"
            className="h-6 rounded-lg p-2 text-xs"
          >
            <Link href={`/lookup/${result.domain}`}>{result.domain}</Link>
          </Button>
        ))}
      </>
      <Drawer direction="right">
        <DrawerTrigger>
          <Button
            key="show-more-subdomains"
            variant="secondary"
            className="h-6 cursor-pointer rounded-lg text-xs"
            aria-label="Show more subdomains"
          >
            <GalleryVerticalEndIcon className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SubdomainsRow;
