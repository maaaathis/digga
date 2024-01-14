import { CircleOff } from 'lucide-react';
import { type FC, ReactElement } from 'react';

import { CreateSnapshotCTA } from '@/app/lookup/[domain]/archive/_components/CreateSnapshotCTA';
import WebArchiveItem from '@/app/lookup/[domain]/archive/_components/WebArchiveItem';
import StyledError from '@/components/StyledError';

type ArchivePageProps = {
  params: {
    domain: string;
  };
};

const ArchivePage: FC<ArchivePageProps> = async ({
  params: { domain },
}): Promise<ReactElement> => {
  // fetch latest snapshot by WebArchive
  const latestSnapshotFetch = await fetch(
    `https://archive.org/wayback/available?url=${domain}`
  );
  const latestSnapshot = await latestSnapshotFetch.json();

  console.log(latestSnapshot);

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
