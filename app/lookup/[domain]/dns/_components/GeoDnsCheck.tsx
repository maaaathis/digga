import { isbot } from 'isbot';
import { CheckCircleIcon, InfoIcon } from 'lucide-react';
import { headers } from 'next/headers';
import type { FC, ReactElement } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import InternalDoHResolver from '@/lib/resolvers/InternalDoHResolver';

const geoDNSLocations = ['bom', 'fra']; // re-add "iad" later

interface Props {
  domain: string;
}

export const GeoDnsCheck: FC<Props> = async ({
  domain,
}): Promise<ReactElement> => {
  const header = await headers();
  const userAgent = header.get('user-agent');
  const isBotRequest = !userAgent || isbot(userAgent);

  if (isBotRequest) return <></>;

  const geoDnsMarkers = await Promise.all(
    geoDNSLocations.map(async (code) => {
      const resolver = new InternalDoHResolver(code, 'cloudflare');
      const results = await Promise.all([
        resolver.resolveRecordType(domain, 'A'),
        resolver.resolveRecordType(domain, 'AAAA'),
        resolver.resolveRecordType(domain, 'CNAME'),
      ]);

      return {
        code,
        results: {
          A: results[0].map((r) => r.data),
          AAAA: results[1].map((r) => r.data),
          CNAME: results[2].map((r) => r.data),
        },
      };
    })
  );

  const usesGeoDNS =
    geoDnsMarkers &&
    geoDnsMarkers.some((marker, index) => {
      if (index === 0) return false;

      const previous = geoDnsMarkers[index - 1].results;
      const current = marker.results;

      const compareRecords = (recordType: 'A' | 'AAAA' | 'CNAME') => {
        return (
          previous[recordType].length !== current[recordType].length ||
          previous[recordType].some(
            (ip, idx) => ip !== current[recordType][idx]
          )
        );
      };

      return (
        compareRecords('A') || compareRecords('AAAA') || compareRecords('CNAME')
      );
    });

  return (
    <Alert className="mx-auto my-6">
      {usesGeoDNS ? (
        <>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Different records detected!</AlertTitle>
          <AlertDescription>
            Some regions have different records for this domain. This{' '}
            <i>could</i> be an indication for the use of GeoDNS.
            <br />
            <span className="text-xs">
              Keep in mind however, that some providers rotate their IP
              addresses, which can also lead to different results.
            </span>
          </AlertDescription>
        </>
      ) : (
        <>
          <CheckCircleIcon className="h-4 w-4" />
          <AlertTitle>No GeoDNS detected!</AlertTitle>
          <AlertDescription>
            All records are consistent over multiple regions. Therefore
            propagation was successful and the domain is not using GeoDNS.
          </AlertDescription>
        </>
      )}
    </Alert>
  );
};

export default GeoDnsCheck;
