'use client';

import {
  FC,
  type MouseEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BookmarkletLink: FC = (): ReactElement => {
  const [target, setTarget] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const rawScript = `
      (function(){
        var tab = window.open('${location.origin}/lookup/'+location.hostname, '_blank');
        if (!tab) {
          alert('Could not open results in new tab!');
          return;
        }
        tab.focus();
      })();
    `;
    const minifiedScript = rawScript
      .split('\n')
      .map((line) => line.trim())
      .join('');
    setTarget(`javascript:${minifiedScript}`);
  }, []);

  const clickHandler = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    (event) => {
      event.preventDefault();
      setIsOpen(true);
    },
    [setIsOpen]
  );

  return (
    <>
      <div className="flex justify-center">
        {target ? (
          <a
            className="dark:bg-secondary rounded-lg bg-slate-200 p-2 px-4 text-center duration-300 select-none hover:scale-105 hover:cursor-grab active:cursor-grabbing"
            href={target}
            onClick={clickHandler}
          >
            Inspect Domain
          </a>
        ) : (
          <span className="text-center">Loading...</span>
        )}
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Installation required</AlertDialogTitle>
            <AlertDialogDescription>
              This link is a bookmarklet intended to be dragged into your
              browser&apos;s bookmark bar. It can be clicked from anywhere to
              open the results page for the site you are currently on.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ok</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookmarkletLink;
