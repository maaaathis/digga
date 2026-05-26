import { Activity, Calendar, Globe2, Mail, ShieldCheck, ShieldOff } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Fact = {
	icon: ReactNode;
	label: string;
	value: ReactNode;
	tone?: 'default' | 'good' | 'muted';
};

type QuickFactsProps = {
	facts: Fact[];
};

const TONE_CLASSES = {
	default: 'text-foreground',
	good: 'text-emerald-700 dark:text-emerald-400',
	muted: 'text-muted-foreground',
};

const QuickFacts: FC<QuickFactsProps> = ({ facts }) => (
	<ul className="border-border/60 grid grid-cols-2 overflow-hidden rounded-2xl border md:grid-cols-4">
		{facts.map((fact, index) => (
			<li
				key={fact.label}
				className={cn(
					'border-border/60 bg-card/40 flex flex-col gap-1.5 p-4',
					index < facts.length - 1 ? 'border-r' : '',
					'max-md:[&:nth-child(2n)]:border-r-0 max-md:[&:nth-child(n+3)]:border-t',
					'md:border-r md:last:border-r-0',
				)}
			>
				<span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
					{fact.icon}
					{fact.label}
				</span>
				<span className={cn('text-sm font-semibold', TONE_CLASSES[fact.tone ?? 'default'])}>
					{fact.value}
				</span>
			</li>
		))}
	</ul>
);

export function buildQuickFacts(input: {
	registeredAt?: string | null;
	expiresAt?: string | null;
	dnssec: boolean | null;
	nameserverCount: number;
	hasMx: boolean;
	registrar?: string | null;
}): Fact[] {
	const facts: Fact[] = [];

	if (input.registeredAt) {
		const date = new Date(input.registeredAt);
		if (!Number.isNaN(date.getTime())) {
			const now = new Date();
			const years = now.getFullYear() - date.getFullYear();
			const monthsRaw = years * 12 + (now.getMonth() - date.getMonth());
			const age =
				years >= 1
					? `${years} year${years === 1 ? '' : 's'}`
					: `${Math.max(monthsRaw, 1)} month${monthsRaw === 1 ? '' : 's'}`;
			facts.push({
				icon: <Calendar className="size-3.5" />,
				label: 'Age',
				value: age,
			});
		}
	}

	if (input.expiresAt) {
		const date = new Date(input.expiresAt);
		if (!Number.isNaN(date.getTime())) {
			const diffDays = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
			const value =
				diffDays > 365
					? `${Math.round(diffDays / 365)} years`
					: diffDays > 0
						? `${diffDays} days`
						: 'expired';
			facts.push({
				icon: <Activity className="size-3.5" />,
				label: 'Expires in',
				value,
				tone: diffDays < 30 ? 'good' : 'default',
			});
		}
	}

	facts.push({
		icon: input.dnssec ? <ShieldCheck className="size-3.5" /> : <ShieldOff className="size-3.5" />,
		label: 'DNSSEC',
		value: input.dnssec ? 'signed' : input.dnssec === false ? 'not signed' : 'unknown',
		tone: input.dnssec ? 'good' : 'muted',
	});

	facts.push({
		icon: <Globe2 className="size-3.5" />,
		label: 'Nameservers',
		value: input.nameserverCount.toString(),
	});

	facts.push({
		icon: <Mail className="size-3.5" />,
		label: 'Mail',
		value: input.hasMx ? 'configured' : 'no MX records',
		tone: input.hasMx ? 'default' : 'muted',
	});

	return facts.slice(0, 4);
}

export default QuickFacts;
