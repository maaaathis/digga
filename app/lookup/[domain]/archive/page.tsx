import { CircleOff } from 'lucide-react';
import { DateTime } from 'luxon';
import { Metadata } from 'next';
import { type FC, ReactElement } from 'react';

import { CreateSnapshotCTA } from '@/app/lookup/[domain]/archive/_components/CreateSnapshotCTA';
import WebArchiveItem from '@/app/lookup/[domain]/archive/_components/WebArchiveItem';
import StyledError from '@/components/StyledError';

type ArchivePageProps = {
  params: {
    domain: string;
  };
};

export const generateMetadata = ({
  params: { domain },
}: ArchivePageProps): Metadata => ({
  openGraph: {
    url: `/lookup/${domain}/archive`,
  },
  alternates: {
    canonical: `/lookup/${domain}/archive`,
  },
});

const ArchivePage: FC<ArchivePageProps> = async ({
  params: { domain },
}): Promise<ReactElement> => {
  // fetch latest snapshot by WebArchive
  const latestSnapshotFetch = await fetch(
    `https://archive.org/wayback/available?url=${domain}`
  );
  const latestSnapshot = await latestSnapshotFetch.json();

  console.log(latestSnapshot);

  async function fetchData(
    timestamp,
    resultArray,
    domain,
    callback,
    gotDifferenceInMonths
  ) {
    const formattedTimestamp = DateTime.fromFormat(
      timestamp,
      'yyyyMMddHHmmss'
    ).toFormat('yyyyMMddHHmmss');
    const url = `https://archive.org/wayback/available?url=${domain}&timestamp=${formattedTimestamp}`;

    try {
      const latestSnapshotFetch = await fetch(url);
      const responseData = await latestSnapshotFetch.json();

      if (
        responseData.archived_snapshots &&
        responseData.archived_snapshots.closest
      ) {
        const closestTimestamp =
          responseData.archived_snapshots.closest.timestamp;

        if (responseData.archived_snapshots.closest.timestamp === timestamp) {
          if (gotDifferenceInMonths > 48) return;

          const nextTimestamp = DateTime.fromFormat(
            closestTimestamp,
            'yyyyMMddHHmmss'
          ).minus({ months: gotDifferenceInMonths * 2 });

          const formattedNextTimestamp =
            nextTimestamp.toFormat('yyyyMMddHHmmss');

          await fetchData(
            formattedNextTimestamp,
            resultArray,
            domain,
            callback,
            gotDifferenceInMonths * 2
          );
        }

        resultArray.push(responseData);

        if (callback) {
          callback(resultArray);
        }

        // Berechnen Sie den nächsten Timestamp basierend auf der Differenz zum vorherigen
        let nextTimestamp;
        const differenceInMonths = DateTime.fromFormat(
          closestTimestamp,
          'yyyyMMddHHmmss'
        ).diff(
          DateTime.fromFormat(timestamp, 'yyyyMMddHHmmss'),
          'months'
        ).months;

        if (differenceInMonths > -6) {
          // Wenn die Differenz größer als -6 Monate ist, setze den nächsten Timestamp auf -6 Monate
          nextTimestamp = DateTime.fromFormat(
            closestTimestamp,
            'yyyyMMddHHmmss'
          ).minus({ months: 6 });
        } else {
          // Andernfalls setze den nächsten Timestamp auf -1 Monat
          nextTimestamp = DateTime.fromFormat(
            closestTimestamp,
            'yyyyMMddHHmmss'
          ).minus({ months: 1 });
        }

        const formattedNextTimestamp = nextTimestamp.toFormat('yyyyMMddHHmmss');

        await fetchData(
          formattedNextTimestamp,
          resultArray,
          domain,
          callback,
          differenceInMonths
        );
      } else {
        // Stoppen Sie die Rekursion, wenn keine älteren Snapshots mehr gefunden werden
        console.log('Keine älteren Snapshots gefunden.');
      }
    } catch (error) {
      // Fehlerbehandlung hier, wenn die Anfrage fehlschlägt
      console.error('Fehler bei der Anfrage:', error);
    }
  }

  const resultArray = [];

  fetchData(
    latestSnapshot.archived_snapshots.closest.timestamp,
    resultArray,
    domain,
    (finalResult) => {
      console.log('Endgültiges Ergebnis:', finalResult);
    },
    1
  );

  if (!latestSnapshot.archived_snapshots.closest) {
    return (
      <div className="flex h-full w-full">
        <div className="m-auto">
          <StyledError
            title="This domain has not been archived yet."
            description="This domain has not been archived yet. Create a snapshot to archive this domain."
            icon={<CircleOff className="h-16 w-16" />}
          />
          <div className="mt-3 flex flex-row justify-center">
            <CreateSnapshotCTA domain={domain} />
          </div>
        </div>
      </div>
    );
  }

  //TODO: fetch older snapshots by WebArchive

  return (
    <>
      <CreateSnapshotCTA domain={domain} />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <WebArchiveItem
          url={latestSnapshot.archived_snapshots.closest.url}
          timestamp={latestSnapshot.archived_snapshots.closest.timestamp}
        />
      </div>
    </>
  );
};

export default ArchivePage;
