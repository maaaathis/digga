'use client';

import { FC, ReactElement, ReactNode } from 'react';
import reactStringReplace from 'react-string-replace';

import { TableCell, TableRow } from '@/components/ui/table';

import IpLink from '@/app/lookup/[domain]/dns/_components/IpLink';
import DomainLink from '@/components/DomainLink';
import { cn, DOMAIN_REGEX, IPV4_REGEX, IPV6_REGEX } from '@/lib/utils';

type RecordRowProps = {
  name: string;
  TTL: number;
  value: string;
  subvalue?: string;
};

const RecordRow: FC<RecordRowProps> = ({
  name,
  TTL,
  value,
  subvalue,
}): ReactElement => {
  let interpolatedValue: ReactNode[] | string | null = value;

  const domainMatches = value.match(DOMAIN_REGEX);
  for (const domain of domainMatches ?? []) {
    interpolatedValue = reactStringReplace(
      interpolatedValue,
      domain,
      (match) => {
        const normalizedMatch = match.endsWith('.')
          ? match.slice(0, -1)
          : match;
        return <DomainLink domain={normalizedMatch} />;
      }
    );
  }

  const ipv4Matches = value.match(IPV4_REGEX);
  for (const domain of ipv4Matches ?? []) {
    interpolatedValue = reactStringReplace(
      interpolatedValue,
      domain,
      (match) => <IpLink value={match} />
    );
  }

  const ipv6Matches = value.match(IPV6_REGEX);
  for (const domain of ipv6Matches ?? []) {
    interpolatedValue = reactStringReplace(
      interpolatedValue,
      domain,
      (match) => <IpLink value={match} />
    );
  }

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="pl-0">{name}</TableCell>
      <TableCell>{TTL}</TableCell>
      <TableCell className={cn('pr-0', { ['py-1']: subvalue })}>
        {interpolatedValue}
        {subvalue && (
          <span className="text-muted-foreground mt-1 block text-xs">
            {subvalue}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default RecordRow;
