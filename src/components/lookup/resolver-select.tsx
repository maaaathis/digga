'use client';

import { ChevronDown, Server } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type ResolverId, RESOLVERS } from '@/lib/dns/types';

type ResolverSelectProps = {
	value: ResolverId;
	onChange: (value: ResolverId) => void;
};

const ResolverSelect: FC<ResolverSelectProps> = ({ value, onChange }) => {
	const active = RESOLVERS.find(resolver => resolver.id === value);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2 rounded-lg">
					<Server className="size-3.5 opacity-60" />
					<span className="font-medium">{active?.label ?? value}</span>
					<ChevronDown className="size-3.5 opacity-60" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-44 rounded-2xl">
				<DropdownMenuLabel>Resolver</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={value} onValueChange={next => onChange(next as ResolverId)}>
					{RESOLVERS.map(resolver => (
						<DropdownMenuRadioItem key={resolver.id} value={resolver.id}>
							{resolver.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ResolverSelect;
