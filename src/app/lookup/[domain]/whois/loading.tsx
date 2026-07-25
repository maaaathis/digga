import type { FC } from 'react';

import { SectionsSkeleton } from '@/components/lookup/report-skeleton';

const Loading: FC = () => (
	<>
		<span role="status" className="sr-only">
			Querying RDAP and WHOIS
		</span>
		<SectionsSkeleton />
	</>
);

export default Loading;
