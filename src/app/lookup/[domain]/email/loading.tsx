import type { FC } from 'react';

import { SectionsSkeleton } from '@/components/lookup/report-skeleton';

const Loading: FC = () => (
	<>
		<span role="status" className="sr-only">
			Checking SPF, DKIM, and DMARC
		</span>
		<SectionsSkeleton cards={4} />
	</>
);

export default Loading;
