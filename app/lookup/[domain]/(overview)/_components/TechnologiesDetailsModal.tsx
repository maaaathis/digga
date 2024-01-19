'use client';

import { GripIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { type FC, ReactElement } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

import { filterWhatRunsDirectUrl } from '@/app/lookup/[domain]/(overview)/_components/TechnologiesWidget';

type Technology = {
  name: string;
  category: number;
  icon: string;
  index: string;
  sourceUrl: string;
  detectedTime: number;
  latestDetectedTime: number;
  website: string;
  siteListUrl: string;
  categoryString?: string;
};

type TechnologiesDetailsProps = {
  technologies: Technology[];
};

const TechnologiesDetailsModal: FC<TechnologiesDetailsProps> = ({
  technologies,
}): ReactElement => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div
        key={'more'}
        onClick={() => setOpen(true)}
        className="mx-auto flex h-12 w-12 justify-center rounded-lg hover:cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
      >
        <GripIcon className="m-auto h-5 w-5 text-black dark:text-white" />
      </div>

      <Dialog modal open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Used Technologies</DialogTitle>
            <DialogDescription className="max-h-96 overflow-scroll overflow-x-hidden">
              <Table>
                <TableBody>
                  {technologies.map((technology: Technology) => {
                    return (
                      <TableRow key={technology.index}>
                        <TableCell>
                          <Image
                            unoptimized
                            src={`https://www.whatruns.com/imgs/${technology.icon}`}
                            alt={technology.name}
                            width={20}
                            height={20}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            className="cursor-pointer select-none decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:decoration-slate-300"
                            href={
                              filterWhatRunsDirectUrl(technology.website) ||
                              technology.website
                            }
                            rel="noreferrer noopener"
                            target="_blank"
                          >
                            {technology.name}
                          </Link>
                        </TableCell>
                        <TableCell>{technology.categoryString}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4">
                <p className="text-xs text-opacity-80">
                  Data provided by{' '}
                  <Link
                    href="https://www.whatruns.com/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="cursor-pointer select-none decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:decoration-slate-300"
                  >
                    WhatRuns.com
                  </Link>
                  .
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TechnologiesDetailsModal;
