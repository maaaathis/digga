import type { FC } from 'react';

import ToolLanding from '@/components/tool/tool-landing';
import { toolMetadata } from '@/lib/seo';

export const metadata = toolMetadata('rdap');

const Page: FC = () => <ToolLanding slug="rdap" />;

export default Page;
