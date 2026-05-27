import { Compass } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

import StateNotice from '@/components/lookup/state-notice';
import { Button } from '@/components/ui/button';

const NotFound: FC = () => (
	<div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-24">
		<StateNotice
			tone="neutral"
			titleAs="h1"
			icon={<Compass className="size-9" />}
			title="This page does not exist"
			description="The page you were looking for could not be found. It may have moved, or the link might be off."
		>
			<Button asChild size="lg" className="h-12 px-7 text-base font-semibold">
				<Link href="/">Back to home</Link>
			</Button>
		</StateNotice>
	</div>
);

export default NotFound;
