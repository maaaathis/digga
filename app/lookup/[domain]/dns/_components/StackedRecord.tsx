import type { FC, ReactNode } from 'react';
import reactStringReplace from 'react-string-replace';

import IpLink from '@/app/lookup/[domain]/dns/_components/IpLink';
import DomainLink from '@/components/DomainLink';
import { DOMAIN_REGEX, IPV4_REGEX, IPV6_REGEX } from '@/lib/utils';

type StackedRecordProps = {
  name: string;
  TTL: number;
  value: string;
  subvalue?: string;
};

const StackedRecord: FC<StackedRecordProps> = async ({
  name,
  TTL,
  value,
  subvalue,
}) => {
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
    <div className="flex flex-col gap-1">
      <div className="flex justify-between font-bold">
        <span>{name}</span>
        <span>{TTL}</span>
      </div>
      <p className="break-words">{interpolatedValue}</p>
      {subvalue && (
        <span className="mt-1 block break-words text-xs text-muted-foreground">
          {subvalue}
        </span>
      )}
    </div>
  );
};

export default StackedRecord;
