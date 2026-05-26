import {
	Activity,
	Building2,
	Calendar,
	Globe2,
	Mail,
	MailCheck,
	Server,
	ShieldCheck,
	ShieldOff,
} from 'lucide-react';
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
	<ul className="border-border/60 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] overflow-hidden rounded-2xl border">
		{facts.map(fact => (
			<li
				key={fact.label}
				className="border-border/60 bg-card/40 flex flex-col gap-1.5 border-r border-b p-4"
			>
				<span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
					{fact.icon}
					{fact.label}
				</span>
				<span
					className={cn('truncate text-sm font-semibold', TONE_CLASSES[fact.tone ?? 'default'])}
				>
					{fact.value}
				</span>
			</li>
		))}
	</ul>
);

export type EmailPosture = 'full' | 'partial' | 'none';

export function buildQuickFacts(input: {
	registeredAt?: string | null;
	expiresAt?: string | null;
	dnssec: boolean | null;
	nameserverCount: number;
	hasMx: boolean;
	registrar?: string | null;
	hostingOrg?: string | null;
	emailPosture?: EmailPosture | null;
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

	if (input.hostingOrg) {
		facts.push({
			icon: <Server className="size-3.5" />,
			label: 'Hosting',
			value: input.hostingOrg,
		});
	}

	facts.push({
		icon: <Mail className="size-3.5" />,
		label: 'Mail',
		value: input.hasMx ? 'configured' : 'no MX records',
		tone: input.hasMx ? 'default' : 'muted',
	});

	if (input.emailPosture) {
		const map: Record<EmailPosture, { value: string; tone: Fact['tone'] }> = {
			full: { value: 'SPF + DMARC', tone: 'good' },
			partial: { value: 'Partial', tone: 'default' },
			none: { value: 'Not set', tone: 'muted' },
		};
		facts.push({
			icon: <MailCheck className="size-3.5" />,
			label: 'Email auth',
			value: map[input.emailPosture].value,
			tone: map[input.emailPosture].tone,
		});
	}

	if (input.nameserverCount > 0) {
		facts.push({
			icon: <Globe2 className="size-3.5" />,
			label: 'Nameservers',
			value: input.nameserverCount.toString(),
		});
	}

	if (input.registrar) {
		facts.push({
			icon: <Building2 className="size-3.5" />,
			label: 'Registrar',
			value: input.registrar,
		});
	}

	return facts.slice(0, 4);
}

export default QuickFacts;
