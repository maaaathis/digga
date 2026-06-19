import type { FC } from 'react';

import ToolLanding from '@/components/tool/tool-landing';
import { toolMetadata } from '@/lib/seo';

export const metadata = toolMetadata('email');

const Page: FC = () => <ToolLanding slug="email" />;

export default Page;
