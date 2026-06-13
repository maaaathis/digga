import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

import StateNotice from '@/components/lookup/state-notice';
import { Button } from '@/components/ui/button';

type DomainTldNotFoundProps = {
	tld: string;
};

const DomainTldNotFound: FC<DomainTldNotFoundProps> = ({ tld }) => (
	<StateNotice
		tone="warning"
		titleAs="h1"
		icon={<AlertTriangle className="size-9" />}
		title="That TLD does not exist"
		description={
			tld
				? `.${tld} is not a real top level domain, so there is nothing to look up. Check the spelling and try again.`
				: 'That is not a real top level domain, so there is nothing to look up. Check the spelling and try again.'
		}
	>
		<Button asChild size="lg" className="h-12 px-7 text-base font-semibold">
			<Link href="/">Back to search</Link>
		</Button>
	</StateNotice>
);

export default DomainTldNotFound;
