import { Globe, Lock } from 'lucide-react';
import type { FC } from 'react';

import StateNotice from '@/components/lookup/state-notice';

type DomainReservedProps = {
	domain: string;
};

const DomainReserved: FC<DomainReservedProps> = ({ domain }) => (
	<StateNotice
		tone="neutral"
		icon={<Lock className="size-9" />}
		badge={
			<div className="border-border/60 bg-card text-muted-foreground inline-flex items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-3 text-sm font-medium">
				<Lock className="size-3.5" />
				Reserved by the registry
			</div>
		}
		title="This domain is reserved"
		description={`${domain} is held back by the registry and cannot be registered. There is no active registration, so there is nothing to dig up here yet.`}
		footnote={
			<>
				<Globe className="size-3.5" />
				Status is based on WHOIS and can change if the registry releases the name.
			</>
		}
	/>
);

export default DomainReserved;
