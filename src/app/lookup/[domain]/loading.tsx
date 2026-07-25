import type { FC } from 'react';

import { OverviewSkeleton } from '@/components/lookup/report-skeleton';

const Loading: FC = () => (
	<>
		<span role="status" className="sr-only">
			Loading domain report
		</span>
		<OverviewSkeleton />
	</>
);

export default Loading;
