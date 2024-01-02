import Link from 'next/link';
import React from 'react';
import whoiser from 'whoiser';

import { Badge } from '@/components/ui/badge';

import DashboardItem from './DashboardItem';

interface Props {
  domain: string;
}

const DomainlabelWidget: React.FC<Props> = async ({
  domain,
}): Promise<React.ReactElement | null> => {
  // @ts-ignore
  const whoisResult = whoiser.firstResult(
    await whoiser(domain, {
      timeout: 3000,
    })
  );

  if (
    !whoisResult['Domain Status'] ||
    whoisResult['Domain Status'].length === 0
  )
    return null;

  return (
    <DashboardItem title="Domainlabels">
      <div className="flex h-full flex-col gap-2">
        {Object.values(whoisResult['Domain Status']).map(
          (label: unknown, index: number) => {
            const labelValue = label as string;
            return (
              <Link
                className={`${
                  labelValue.split(' ')[1] ? 'cursor-pointer' : 'cursor-text'
                }`}
                href={labelValue.split(' ')[1]}
                target="_blank"
                rel="noreferrer noopener"
                key={labelValue}
              >
                <Badge
                  variant="outline"
                  className="text-base hover:border-dashed"
                >
                  {labelValue.split(' ')[0]}
                </Badge>
              </Link>
            );
          }
        )}
      </div>
    </DashboardItem>
  );
};

export default DomainlabelWidget;
