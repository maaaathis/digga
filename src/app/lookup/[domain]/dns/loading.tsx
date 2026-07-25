import type { FC } from 'react';

import { TableSkeleton } from '@/components/lookup/report-skeleton';

const Loading: FC = () => (
	<>
		<span role="status" className="sr-only">
			Resolving DNS records
		</span>
		<TableSkeleton />
	</>
);

export default Loading;
