'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

import { Button } from '@/components/ui/button';

export const FlushGoogleDnsCacheButton: FC = () => {
  return (
    <Link
      href="https://dns.google/cache"
      target="_blank"
      rel="noopener"
      className="my-auto"
    >
      <Button
        variant="outline"
        className="rounded-lg text-sm font-medium"
        data-umami-event="goto-flush-googledns"
      >
        Flush Google DNS Cache
        <ExternalLink className="ml-2 h-3 w-3" />
      </Button>
    </Link>
  );
};

export default FlushGoogleDnsCacheButton;
