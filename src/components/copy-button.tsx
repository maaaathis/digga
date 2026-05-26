'use client';

import { Check, Copy } from 'lucide-react';
import { type FC, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CopyButtonProps = {
	value: string;
	className?: string;
	label?: string;
	size?: 'sm' | 'icon';
};

const CopyButton: FC<CopyButtonProps> = ({ value, className, label, size = 'icon' }) => {
	const [copied, setCopied] = useState(false);

	const onCopy = useCallback(async () => {
		if (!navigator.clipboard) return;
		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, [value]);

	if (size === 'sm') {
		return (
			<Button
				variant="ghost"
				size="sm"
				onClick={onCopy}
				className={cn('gap-1.5 text-xs', className)}
				aria-label={label ?? 'Copy'}
			>
				{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
				{label}
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={onCopy}
			className={cn('size-7', className)}
			aria-label={label ?? 'Copy'}
		>
			{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
		</Button>
	);
};

export default CopyButton;
