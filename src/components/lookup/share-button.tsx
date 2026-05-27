'use client';

import { Check, Share2 } from 'lucide-react';
import { type FC, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

const ShareButton: FC = () => {
	const [copied, setCopied] = useState(false);

	const onShare = async () => {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		if (!url) return;

		const canNativeShare = typeof navigator.share === 'function';
		trackEvent('share', { method: canNativeShare ? 'native' : 'clipboard' });

		if (canNativeShare) {
			try {
				await navigator.share({ title: document.title, url });
				return;
			} catch {
				// user cancelled, fall through to copy
			}
		}

		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success('Link copied to clipboard');
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error('Could not copy link');
		}
	};

	return (
		<Button variant="outline" size="sm" onClick={onShare} className="gap-2 rounded-lg">
			{copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
			Share
		</Button>
	);
};

export default ShareButton;
