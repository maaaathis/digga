'use client';

import { BookmarkPlus } from 'lucide-react';
import { type FC, type MouseEventHandler, useCallback, useEffect, useState } from 'react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BookmarkletLink: FC = () => {
	const [target, setTarget] = useState('');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const raw = `
      (function(){
        var tab = window.open('${location.origin}/lookup/'+location.hostname, '_blank');
        if (!tab) { alert('Could not open results in new tab.'); return; }
        tab.focus();
      })();
    `;
		const minified = raw
			.split('\n')
			.map(line => line.trim())
			.join('');
		setTarget(`javascript:${minified}`);
	}, []);

	const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(event => {
		event.preventDefault();
		setOpen(true);
	}, []);

	return (
		<>
			<div className="flex justify-center">
				{target ? (
					<a
						href={target}
						onClick={onClick}
						className="ring-border/60 hover:ring-foreground/40 bg-background text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-1 transition-all duration-200 select-none hover:-translate-y-0.5 hover:cursor-grab active:cursor-grabbing"
					>
						<BookmarkPlus className="size-4" />
						Inspect this site
					</a>
				) : (
					<span className="text-muted-foreground text-sm">Loading</span>
				)}
			</div>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Drag this to your bookmark bar</AlertDialogTitle>
						<AlertDialogDescription>
							This link is a bookmarklet. Drag it into your browser bookmark bar instead of
							clicking. Once saved, you can hit it from any site to jump straight to the digga
							results page for that domain.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction>Got it</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default BookmarkletLink;
