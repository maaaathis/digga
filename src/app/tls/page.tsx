import type { FC } from 'react';

import ToolLanding from '@/components/tool/tool-landing';
import { toolMetadata } from '@/lib/seo';

export const metadata = toolMetadata('tls');

const Page: FC = () => <ToolLanding slug="tls" />;

export default Page;
