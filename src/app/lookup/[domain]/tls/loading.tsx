import type { FC } from 'react';

import { SectionsSkeleton } from '@/components/lookup/report-skeleton';

const Loading: FC = () => (
	<>
		<span role="status" className="sr-only">
			Fetching the TLS certificate
		</span>
		<SectionsSkeleton cards={2} />
	</>
);

export default Loading;
