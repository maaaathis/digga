'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@nextui-org/react';
import { LaptopIcon, MoonIcon, SunMediumIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { FC } from 'react';

const ThemeMenu: FC<Record<string, never>> = () => {
  const { setTheme } = useTheme();

  return (
    <Dropdown
      showArrow
      radius="sm"
      classNames={{
        base: 'p-0 border-small border-divider bg-background',
        arrow: 'bg-default-200',
      }}
    >
      <DropdownTrigger>
        <Button variant="ghost" className="bg-background" disableRipple>
          <SunMediumIcon className="rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Toggle theme"
        disabledKeys={['profile']}
        className="p-3"
        itemClasses={{
          base: [
            'rounded-md',
            'text-default-500',
            'transition-opacity',
            'data-[hover=true]:text-foreground',
            'data-[hover=true]:bg-default-100',
            'dark:data-[hover=true]:bg-default-50',
            'data-[selectable=true]:focus:bg-default-50',
            'data-[pressed=true]:opacity-70',
            'data-[focus-visible=true]:ring-default-500',
          ],
        }}
      >
        <DropdownSection aria-label="Dark & Light Mode" showDivider>
          <DropdownItem
            onClick={() => setTheme('light')}
            key="Light"
            startContent={
              <SunMediumIcon className="pointer-events-none flex-shrink-0 text-xl text-default-500" />
            }
          >
            Light
          </DropdownItem>
          <DropdownItem
            onClick={() => setTheme('dark')}
            key="Dark"
            startContent={
              <MoonIcon className="pointer-events-none flex-shrink-0 text-xl text-default-500" />
            }
          >
            Dark
          </DropdownItem>
        </DropdownSection>
        <DropdownSection aria-label="System Light Mode">
          <DropdownItem
            onClick={() => setTheme('system')}
            key="System"
            startContent={
              <LaptopIcon className="pointer-events-none flex-shrink-0 text-xl text-default-500" />
            }
          >
            System
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ThemeMenu;
