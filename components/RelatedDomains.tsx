'use client';

import Link from 'next/link';
import type { FC, ReactElement } from 'react';

import { Button } from '@/components/ui/button';

type RelatedDomainsProps = {
  domain: string;
};

const RelatedDomains: FC<RelatedDomainsProps> = ({
  domain: original,
}): ReactElement => {
  const domains = [];

  const splitOriginal = original.split('.');
  for (let i = 1; i < splitOriginal.length - 1; i++) {
    const domain = splitOriginal.slice(i).join('.');
    domains.push(domain);
  }

  if (!original.startsWith('www.') && !original.startsWith('*.')) {
    domains.unshift(`www.${original}`);
  }

  return (
    <div className="flex gap-4">
      {domains.map((domain) => (
        <Button
          key={domain}
          asChild
          variant="secondary"
          className="h-6 rounded-lg p-2 text-xs"
        >
          <Link href={`/lookup/${domain}`}>{domain}</Link>
        </Button>
      ))}
    </div>
  );
};

export default RelatedDomains;
