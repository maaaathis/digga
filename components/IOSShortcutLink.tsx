'use client';

import { FC, ReactElement } from 'react';

const IOSShortcutLink: FC = (): ReactElement => {
  return (
    <div className="flex justify-center">
      <a
        className="select-none rounded-lg bg-slate-200 p-2 px-4 text-center duration-300 hover:scale-105 hover:cursor-pointer dark:bg-secondary"
        href="https://www.icloud.com/shortcuts/7d45a70403ec4bf783d32c45ad61b2d1"
        target="_blank"
        rel="noopener"
      >
        Add shortcut
      </a>
    </div>
  );
};

export default IOSShortcutLink;
