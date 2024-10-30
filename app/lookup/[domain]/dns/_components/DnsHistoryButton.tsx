'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

import { Button } from '@/components/ui/button';

interface Props {
  domain: string;
}

export const DnsHistoryButton: FC<Props> = (props) => {
  const { domain } = props;

  return (
    <Link
      href={`https://dnshistory.org/dns-records/${domain}`}
      target="_blank"
      rel="noopener nofollow"
      className="my-auto"
    >
      <Button
        variant="outline"
        className="rounded-lg text-sm font-medium"
        data-umami-event="goto-dnshistory"
      >
        DNS History
        <ExternalLink className="ml-2 h-3 w-3" />
      </Button>
    </Link>
  );
};

export default DnsHistoryButton;
