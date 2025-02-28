'use client';

import { OptionIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import type { FC, ReactElement } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { useMediaQuery } from '@/hooks/use-media-query';
import { isAppleDevice } from '@/lib/utils';

type ResultsTabsProps = {
  domain: string;
};

const Tab: FC<{
  label: string;
  href: string;
  selected: boolean;
  shortcutNumber: number;
  hideShortcut?: boolean;
}> = ({
  label,
  href,
  selected,
  shortcutNumber,
  hideShortcut,
}): ReactElement => (
  <li className="mr-2" key={label}>
    <Link
      href={href}
      className={
        selected
          ? 'border-primary text-primary relative inline-block w-max rounded-t-lg border-b-2 p-4'
          : 'relative inline-block w-max rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
      }
    >
      {label}
      {!hideShortcut && (
        <span className="text-muted-foreground pointer-events-none absolute bottom-0 left-1/2 block w-full -translate-x-1/2 translate-y-4 text-xs opacity-0 transition-all group-hover:translate-y-6 group-hover:opacity-100">
          {isAppleDevice() ? (
            <>
              <OptionIcon className="inline-block h-3 w-3" strokeWidth={3} />
              {` + ${shortcutNumber}`}
            </>
          ) : (
            `alt+${shortcutNumber}`
          )}
        </span>
      )}
    </Link>
  </li>
);

const ResultsTabs: FC<ResultsTabsProps> = ({ domain }): ReactElement => {
  const router = useRouter();
  const selectedSegment = useSelectedLayoutSegment();

  const isDesktop = useMediaQuery('(min-width: 768px)');

  useHotkeys('alt+1', () => router.push(`/lookup/${domain}`), [router]);
  useHotkeys('alt+2', () => router.push(`/lookup/${domain}/dns`), [router]);
  useHotkeys('alt+3', () => router.push(`/lookup/${domain}/whois`), [router]);
  useHotkeys('alt+4', () => router.push(`/lookup/${domain}/certs`), [router]);

  return (
    <div className="group mt-6 mb-7 border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <ul className="-mb-px flex flex-wrap">
        <Tab
          label="Overview"
          href={`/lookup/${domain}`}
          selected={selectedSegment === '(overview)'}
          shortcutNumber={1}
          hideShortcut={!isDesktop}
        />
        <Tab
          label="DNS"
          href={`/lookup/${domain}/dns`}
          selected={selectedSegment === 'dns'}
          shortcutNumber={2}
          hideShortcut={!isDesktop}
        />
        <Tab
          label="Whois"
          href={`/lookup/${domain}/whois`}
          selected={selectedSegment === 'whois'}
          shortcutNumber={3}
          hideShortcut={!isDesktop}
        />
        <Tab
          label="Certs"
          href={`/lookup/${domain}/certs`}
          selected={selectedSegment === 'certs'}
          shortcutNumber={4}
          hideShortcut={!isDesktop}
        />
      </ul>
    </div>
  );
};

export default ResultsTabs;
