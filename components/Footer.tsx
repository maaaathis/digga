'use client';

import { FC, ReactElement } from 'react';

import CreditsInfo from './CreditsInfo';

const Footer: FC = (): ReactElement => (
  <div className="fixed bottom-4 right-4">
    <CreditsInfo />
  </div>
);

export default Footer;
