import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import DashboardItem from '@/components/overview/DashboardItem';
import TechnologiesDetailsModal from '@/components/TechnologiesDetailsModal';

interface Props {
  domain: string;
}

type Technology = {
  name: string;
  category: number;
  icon: string;
  index: string;
  sourceUrl: string;
  detectedTime: number;
  latestDetectedTime: number;
  website: string;
  siteListUrl: string;
  categoryString?: string;
};

const TechnologiesWidget: React.FC<Props> = async ({
  domain,
}): Promise<React.ReactElement | null> => {
  try {
    const data = await requestAndParseTechnologies(domain);
    const technologies: Technology[] = [];

    if (!data) return null;

    Object.keys(data).forEach((key) => {
      data[key].forEach((technology: Technology) => {
        technology = {
          ...technology,
          categoryString: key,
        };

        technologies.push(technology);
      });
    });

    if (technologies.length === 0) return null;

    return (
      <DashboardItem title={`Technologies`}>
        <div className="h-full">
          <div className="grid grid-cols-4">
            {technologies.map((technology: Technology) => {
              const arrayIndex = technologies.indexOf(technology);

              if (arrayIndex >= 7) return null;

              return (
                <TooltipProvider key={technology.index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={
                          filterWhatRunsDirectUrl(technology.website) ||
                          technology.website
                        }
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mx-auto flex h-12 w-12 justify-center rounded-lg hover:cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div className="m-auto">
                          <Image
                            unoptimized
                            src={`https://www.whatruns.com/imgs/${technology.icon}`}
                            alt={technology.name}
                            width={25}
                            height={25}
                          />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>{technology.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}

            <TechnologiesDetailsModal technologies={technologies} />
          </div>
        </div>
      </DashboardItem>
    );
  } catch (e) {
    return null;
  }
};

async function requestAndParseTechnologies(domain: string) {
  const requestHeaders = new Headers();
  requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  const requestUrlencoded = new URLSearchParams();
  requestUrlencoded.append(
    'data',
    '{"hostname": "' +
      domain +
      '", "url": "' +
      domain +
      '", "rawhostname": "' +
      domain +
      '"}'
  );

  const requestOptions = {
    method: 'POST',
    headers: requestHeaders,
    body: requestUrlencoded,
    next: {
      revalidate: 24 * 60 * 60,
    },
    timeout: 2000,
  };

  try {
    const request = await fetch(
      'https://www.whatruns.com/api/v1/get_site_apps',
      // @ts-ignore
      requestOptions
    );

    if (request.status !== 200) return null;

    const requestJson = await request.json();

    const apps = requestJson.apps;

    if (!apps) return null;

    const appsJson = JSON.parse(apps);

    const appsJsonKey = Object.keys(appsJson)[0];

    return appsJson[appsJsonKey];
  } catch (e) {
    return null;
  }
}

export function filterWhatRunsDirectUrl(url: string): string | undefined {
  const urlObj = new URL(url);

  return 'https://' + urlObj.searchParams.get('target') || undefined;
}

export default TechnologiesWidget;
