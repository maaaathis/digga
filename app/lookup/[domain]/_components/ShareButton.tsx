'use client';

import { CheckCheckIcon, ShareIcon } from 'lucide-react';
import { type FC, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';

export const ShareButton: FC = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleShareCall = useCallback(async () => {
    if ('share' in navigator) {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
      return;
    } else {
      await (navigator as Navigator).clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 4500);
    }
  }, []);

  return (
    <Button
      variant="secondary"
      className="flex h-6 shrink-0 flex-row gap-2 rounded-lg p-2 text-xs"
      onClick={handleShareCall}
      data-umami-event="share"
    >
      {isCopied ? (
        <>
          <CheckCheckIcon className="h-3 w-3 text-green-400" />
          <span className="tracking-tighter">Copied</span>
        </>
      ) : (
        <>
          <ShareIcon className="h-3 w-3" />
          <span className="tracking-wide">Share</span>
        </>
      )}
    </Button>
  );
};
