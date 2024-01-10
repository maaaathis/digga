import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseDomain(input: string): string {
  const parts = input.split('.');

  if (parts.length <= 2) {
    return input;
  }

  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
}
