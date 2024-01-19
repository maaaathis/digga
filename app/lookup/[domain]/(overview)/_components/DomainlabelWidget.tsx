'use client';

import Link from 'next/link';
import React from 'react';

import { Badge } from '@/components/ui/badge';

import DashboardItem from './DashboardItem';

interface Props {
  // whoiser doesn't have a proper type definition :c
  whoisData: any;
}

const DomainlabelWidget: React.FC<Props> = ({
  whoisData,
}): React.ReactElement | null => {
  const whoisResult = whoisData;

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
            return labelValue && labelValue.split(' ')[1] ? (
              <Link
                className="cursor-pointer"
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
            ) : (
              <span>
                <Badge
                  variant="outline"
                  className="cursor-text text-base"
                  key={labelValue}
                >
                  {labelValue.split(' ')[0]}
                </Badge>
              </span>
            );
          }
        )}
      </div>
    </DashboardItem>
  );
};

export default DomainlabelWidget;
