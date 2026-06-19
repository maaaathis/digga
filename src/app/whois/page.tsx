import type { FC } from 'react';

import ToolLanding from '@/components/tool/tool-landing';
import { toolMetadata } from '@/lib/seo';

export const metadata = toolMetadata('whois');

const Page: FC = () => <ToolLanding slug="whois" />;

export default Page;
