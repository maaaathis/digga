import { isbot } from 'isbot';
import { CheckCircleIcon, InfoIcon, ShieldAlertIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import type { FC } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import ResultsGlobe from '@/app/lookup/[domain]/map/_components/ResultsGlobe';
import { REGIONS } from '@/lib/data';
import InternalDoHResolver from '@/lib/resolvers/InternalDoHResolver';

export const runtime = 'edge';

type MapResultsPageProps = {
  params: {
    domain: string;
  };
};

export const generateMetadata = ({
  params: { domain },
}: MapResultsPageProps): Metadata => ({
  openGraph: {
    url: `/lookup/${domain}/map`,
  },
  alternates: {
    canonical: `/lookup/${domain}/map`,
  },
});

const MapResultsPage: FC<MapResultsPageProps> = async ({
  params: { domain },
}) => {
  const userAgent = headers().get('user-agent');
  const shouldBlockRequest = !userAgent || isbot(userAgent);

  if (shouldBlockRequest) {
    console.log('Bot detected, blocking request, UA:', userAgent);
    return (
      <Alert className="mx-auto mt-24 max-w-max">
        <ShieldAlertIcon className="h-4 w-4" />
        <AlertTitle>Bot or crawler detected!</AlertTitle>
        <AlertDescription>
          To protect our infrastructure, this page is not available for bots or
          crawlers.
          <br />
          But don&apos;t be sad, there&apos;s to crawl here anyway.
        </AlertDescription>
      </Alert>
    );
  }

  const markers = await Promise.all(
    Object.entries(REGIONS).map(async ([code, data]) => {
      const resolver = new InternalDoHResolver(code, 'cloudflare');
      // TODO Optimize this to only required records
      const results = await resolver.resolveAllRecords(domain);

      return {
        ...data,
        code,
        results: {
          A: results.A.map((r) => r.data),
          AAAA: results.AAAA.map((r) => r.data),
          CNAME: results.CNAME.map((r) => r.data),
        },
      };
    })
  );

  const regionEntries = markers.map((marker) => (
    <Link
      href={`/lookup/${domain}?resolver=cloudflare&location=${marker.code}`}
      key={marker.code}
      className="rounded-xl border border-gray-200 p-4 transition-colors duration-200 ease-in-out hover:bg-gray-100"
    >
      <h3 className="mb-2 font-semibold">{marker.name}</h3>
      <ul>
        {marker.results.A.map((ip, index) => (
          <li key={index}>{ip}</li>
        ))}
      </ul>
    </Link>
  ));

  let hasDifferentRecords = false;
  for (let i = 1; i < markers.length; i++) {
    const previous = markers[i - 1].results;
    const current = markers[i].results;
    if (
      previous.A.toSorted().toString() !== current.A.toSorted().toString() ||
      previous.AAAA.toSorted().toString() !==
        current.AAAA.toSorted().toString() ||
      previous.CNAME.toSorted().toString() !==
        current.CNAME.toSorted().toString()
    ) {
      hasDifferentRecords = true;
      break;
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row">
        <div className="basis-2/5">
          <div className="grid grid-cols-2 gap-4">{regionEntries}</div>
        </div>
        <div className="basis-3/5">
          <Alert className="mx-auto">
            {hasDifferentRecords ? (
              <>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Different records detected!</AlertTitle>
                <AlertDescription>
                  Not all regions have the same records for this domain. This{' '}
                  <i>could</i> be an indication for the use of GeoDNS.
                  <br /> Keep in mind however, that some providers rotate their
                  IP addresses, which can also lead to different results.
                </AlertDescription>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                <AlertTitle>All records are the same!</AlertTitle>
                <AlertDescription>
                  All records are the same for all regions. Therefore
                  propagation was successful and the domain is not using GeoDNS.
                </AlertDescription>
              </>
            )}
          </Alert>
          <ResultsGlobe domain={domain} markers={markers} />
        </div>
      </div>
    </>
  );
};

export default MapResultsPage;
