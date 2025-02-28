'use client';

import { ArrowUpRight, Github, Menu } from 'lucide-react';
import Link from 'next/link';
import { FC, ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import ThemeToggle from '@/components/ThemeToggle';

const Header: FC = (): ReactElement => (
  <header className="w-full p-3 md:px-6">
    <div className="flex flex-row items-center justify-between pb-4">
      <Link
        href="/"
        className="rounded-xl py-1.5 pr-1.5 pl-3 hover:bg-gray-200/80 dark:hover:bg-gray-800/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          style={{
            fillRule: 'evenodd',
            clipRule: 'evenodd',
            strokeLinejoin: 'round',
            strokeMiterlimit: 2,
          }}
          viewBox="0 0 700 300"
          className="-ml-2 h-10 w-auto fill-black dark:fill-white"
        >
          <path d="M108.25 214.75c-10.667 0-20.083-1.833-28.25-5.5S65.5 199.5 61 191s-6.75-19.917-6.75-34.25c0-14.167 2.417-26.125 7.25-35.875S73.042 103.75 81.625 98.75s18.292-7.5 29.125-7.5c7.167 0 13.542.833 19.125 2.5S140.833 98 146 101.5V43.75h27.25v168.5H150l-1.75-11.75c-5.333 4.833-11.167 8.417-17.5 10.75s-13.833 3.5-22.5 3.5zm7.25-20.5c12.167 0 22.333-4.167 30.5-12.5V122.5c-7.833-7-17.667-10.5-29.5-10.5-11.5 0-20.167 3.833-26 11.5s-8.75 18.833-8.75 33.5c0 14.167 2.708 23.917 8.125 29.25s13.958 8 25.625 8zM214.75 69V46.5h29.75V69h-29.75zM217 212.25V114.5h-18l2.5-20.75h42.75v118.5H217zm107 44c-8.833 0-17.667-.542-26.5-1.625s-16.333-2.708-22.5-4.875v-21c6.667 2.167 14.333 3.833 23 5s16.917 1.75 24.75 1.75c12 0 20.75-.667 26.25-2s8.25-4.333 8.25-9c0-3.5-1.333-5.958-4-7.375S345.5 215 338 215h-32c-21.5 0-32.25-7.583-32.25-22.75 0-4.833 1.417-9.333 4.25-13.5s7.333-7.333 13.5-9.5c-6.833-3.333-11.875-7.917-15.125-13.75s-4.875-12.833-4.875-21c0-15.167 4.542-26.167 13.625-33S307.833 91.25 326 91.25c3.833 0 7.833.292 12 .875s7.417 1.125 9.75 1.625h43.5l-.75 17.75h-20c3.167 2.667 5.5 6 7 10s2.25 8.333 2.25 13c0 12.667-3.833 22.625-11.5 29.875S349 175.25 333.5 175.25c-2.667 0-5.125-.125-7.375-.375L318.75 174c-5 .5-9.5 1.833-13.5 4s-6 5.083-6 8.75c0 2.5 1 4.292 3 5.375s5.333 1.625 10 1.625h33.25c11.833 0 20.958 2.542 27.375 7.625s9.625 12.458 9.625 22.125c0 11.667-5.042 20.042-15.125 25.125S342.833 256.25 324 256.25zm2-98.25c10.833 0 18.375-1.833 22.625-5.5S355 142.583 355 133.75s-2.125-15.25-6.375-19.25-11.792-6-22.625-6c-10.167 0-17.583 1.917-22.25 5.75s-7 10.333-7 19.5c0 8.5 2.208 14.667 6.625 18.5S315.333 158 326 158zm132.75 98.25c-8.833 0-17.667-.542-26.5-1.625s-16.333-2.708-22.5-4.875v-21c6.667 2.167 14.333 3.833 23 5s16.917 1.75 24.75 1.75c12 0 20.75-.667 26.25-2s8.25-4.333 8.25-9c0-3.5-1.333-5.958-4-7.375S480.25 215 472.75 215h-32c-21.5 0-32.25-7.583-32.25-22.75 0-4.833 1.417-9.333 4.25-13.5s7.333-7.333 13.5-9.5c-6.833-3.333-11.875-7.917-15.125-13.75s-4.875-12.833-4.875-21c0-15.167 4.542-26.167 13.625-33s22.708-10.25 40.875-10.25c3.833 0 7.833.292 12 .875s7.417 1.125 9.75 1.625H526l-.75 17.75h-20c3.167 2.667 5.5 6 7 10s2.25 8.333 2.25 13c0 12.667-3.833 22.625-11.5 29.875s-19.25 10.875-34.75 10.875c-2.667 0-5.125-.125-7.375-.375L453.5 174c-5 .5-9.5 1.833-13.5 4s-6 5.083-6 8.75c0 2.5 1 4.292 3 5.375s5.333 1.625 10 1.625h33.25c11.833 0 20.958 2.542 27.375 7.625s9.625 12.458 9.625 22.125c0 11.667-5.042 20.042-15.125 25.125s-24.542 7.625-43.375 7.625zm2-98.25c10.833 0 18.375-1.833 22.625-5.5s6.375-9.917 6.375-18.75-2.125-15.25-6.375-19.25-11.792-6-22.625-6c-10.167 0-17.583 1.917-22.25 5.75s-7 10.333-7 19.5c0 8.5 2.208 14.667 6.625 18.5S450.083 158 460.75 158zm115.5 56.75c-7.5 0-14.458-1.333-20.875-4s-11.542-6.708-15.375-12.125-5.75-12.125-5.75-20.125c0-11.333 3.875-20.458 11.625-27.375s19.708-10.375 35.875-10.375h38v-5.25c0-5.667-.875-10.167-2.625-13.5s-4.917-5.75-9.5-7.25-11.292-2.25-20.125-2.25c-14 0-27.083 2.083-39.25 6.25V98.5c5.333-2.167 11.833-3.917 19.5-5.25s15.917-2 24.75-2c17.333 0 30.542 3.5 39.625 10.5S645.75 120.167 645.75 136v76.25H622.5l-1.75-12c-4.833 4.667-10.792 8.25-17.875 10.75s-15.958 3.75-26.625 3.75zm7.25-19.5c8.167 0 15.292-1.375 21.375-4.125s11.042-6.458 14.875-11.125v-20.75h-37.5c-8 0-13.792 1.542-17.375 4.625S559.5 171.667 559.5 178c0 6.167 2.083 10.583 6.25 13.25s10.083 4 17.75 4z" />
        </svg>
        <span className="sr-only">digga</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="w-11 cursor-pointer data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800"
            aria-label="Menu"
          >
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-60 overflow-hidden rounded-2xl p-3"
        >
          <DropdownMenuItem asChild>
            <Link
              className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3"
              href="https://github.com/maaaathis/digga"
              target="_blank"
              rel="noreferrer noopener"
            >
              <div className="flex flex-row gap-1">
                <Github className="my-auto h-4 w-4" />
                <span className="text-base font-medium">GitHub</span>
              </div>
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </DropdownMenuItem>
          <p className="text-muted-foreground mx-4 mt-2 text-xs">
            Built by{' '}
            <Link
              href="https://github.com/maaaathis"
              target="_blank"
              rel="noreferrer noopener"
              className="underline-offset-4 hover:underline"
            >
              maaaathis
            </Link>{' '}
            &{' '}
            <Link
              href="https://github.com/wotschofsky"
              target="_blank"
              rel="noreferrer noopener nofollow"
              className="underline-offset-4 hover:underline"
            >
              Felix Wotschofsky
            </Link>
            . Hosted on Vercel.
          </p>
          <DropdownMenuSeparator className="my-3" />
          <DropdownMenuItem asChild>
            <ThemeToggle />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
);

export default Header;
