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

export function getTLD(domain: string): string | null {
  const tldRegex = /\.([a-z]{2,})$/i;
  const match = tldRegex.exec(domain);

  if (match) {
    return match[1];
  }

  return null;
}

export function cutLastDot(input: string): string {
  if (input.endsWith('.')) {
    return input.slice(0, -1);
  }

  return input;
}

// From https://stackoverflow.com/a/30471209/12475254
export const retry = <T extends Function>(fn: T, maxRetries: number) =>
  fn().catch((err: Error) => {
    if (maxRetries <= 0) {
      throw err;
    }
    console.warn(err.message);
    return retry(fn, maxRetries - 1);
  });

export const isAppleDevice = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return /Mac|iPad|iPhone|iPod/.test(userAgent);
};
