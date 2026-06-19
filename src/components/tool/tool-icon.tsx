import { Braces, Globe2, Layers, MailCheck, ScrollText, ShieldCheck } from 'lucide-react';
import type { FC } from 'react';

import type { ToolIconKey } from '@/lib/tools';
import { cn } from '@/lib/utils';

const ICONS = {
	dns: Globe2,
	whois: ScrollText,
	rdap: Braces,
	subdomains: Layers,
	email: MailCheck,
	tls: ShieldCheck,
} as const;

type ToolIconProps = { iconKey: ToolIconKey; className?: string };

const ToolIcon: FC<ToolIconProps> = ({ iconKey, className }) => {
	const Icon = ICONS[iconKey];
	return <Icon className={cn('size-5', className)} />;
};

export default ToolIcon;
