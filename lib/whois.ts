import whoiser, { WhoisSearchResult } from 'whoiser';

import { getTLD } from '@/lib/utils';

export enum DomainAvailability {
  UNKNOWN = 'unknown',
  RESERVED = 'reserved',
  REGISTERED = 'registered',
  AVAILABLE = 'available',
}

export default async function whois(
  domain: string
): Promise<WhoisSearchResult | null> {
  try {
    return await whoiser(domain);
  } catch (error: any) {
    if (
      typeof error?.message === 'string' &&
      error.message.includes('TLD for') &&
      error.message.includes('not supported')
    ) {
      // TLD not supported
      return null;
    }
    console.error('Error in whois():', error);
    return null;
  }
}

async function isAvailable(domain: string): Promise<string> {
  domain = domain.toLowerCase();

  // accept also subdomains
  if (domain.includes('.')) {
    domain = domain.split('.').slice(-2).join('.');
  }

  let domainWhois;
  try {
    domainWhois = await whoiser(domain, { follow: 1 });
  } catch (error: any) {
    if (
      typeof error?.message === 'string' &&
      error.message.includes('TLD for') &&
      error.message.includes('not supported')
    ) {
      return DomainAvailability.UNKNOWN;
    } else {
      console.error('Error in isAvailable:', error);
      return DomainAvailability.UNKNOWN;
    }
  }

  // @ts-ignore
  const firstDomainWhois = domainWhois ? firstResult(domainWhois) : null;
  if (!firstDomainWhois) return DomainAvailability.UNKNOWN;

  const firstTextLine = (
    (firstDomainWhois.text && firstDomainWhois.text[0]) ||
    ''
  ).toLowerCase();

  let domainAvailability = DomainAvailability.UNKNOWN;

  if (firstTextLine.includes('reserved')) {
    domainAvailability = DomainAvailability.RESERVED;
  } else if (
    firstDomainWhois['Domain Name'] &&
    firstDomainWhois['Domain Name'].toLowerCase() === domain &&
    !firstDomainWhois['Domain Status']?.includes('free')
  ) {
    domainAvailability = DomainAvailability.REGISTERED;
  } else if (firstTextLine.includes(`no match for "${domain}"`)) {
    domainAvailability = DomainAvailability.AVAILABLE;
  }

  // Status: available
  if (
    firstDomainWhois['Domain Status']?.includes('available') ||
    firstDomainWhois['Domain Status']?.includes('AVAILABLE') ||
    firstDomainWhois['Domain Status']?.includes('free')
  )
    return DomainAvailability.AVAILABLE;

  return domainAvailability;
}

export async function isDomainAvailable(domain: string): Promise<boolean> {
  if (!domain) return true;

  const tld = getTLD(domain);
  if (!tld) return true;

  // .ch & .li registry does not support whois :c
  if (tld === 'ch' || tld === 'li') return false;

  try {
    return (await isAvailable(domain)) === DomainAvailability.AVAILABLE;
  } catch (error) {
    console.error('Error in isDomainAvailable:', error);
    return false;
  }
}
