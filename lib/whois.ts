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
): Promise<WhoisSearchResult> {
  return await whoiser(domain);
}

async function isAvailable(domain: string): Promise<string> {
  domain = domain.toLowerCase();
  //accept also subdomains
  if (domain.includes('.')) {
    domain = domain.split('.').slice(-2).join('.');
  }

  const domainWhois = await whoiser(domain, { follow: 1 });

  // @ts-ignore
  const firstDomainWhois = whoiser.firstResult(domainWhois);
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
    !firstDomainWhois['Domain Status'].includes('free')
  ) {
    domainAvailability = DomainAvailability.REGISTERED;
  } else if (firstTextLine.includes(`no match for "${domain}"`)) {
    domainAvailability = DomainAvailability.AVAILABLE;
  }

  // Status: available
  if (
    (firstDomainWhois['Domain Status'] &&
      firstDomainWhois['Domain Status'].includes('available')) ||
    (firstDomainWhois['Domain Status'] &&
      firstDomainWhois['Domain Status'].includes('AVAILABLE'))
  )
    return DomainAvailability.AVAILABLE;

  return domainAvailability;
}

export async function isDomainAvailable(domain: string): Promise<boolean> {
  if (!domain) return true;

  const tld = getTLD(domain);
  if (!tld) return true;

  // .ch registry does not support whois :c
  if (tld === 'ch') return false;

  return (await isAvailable(domain)) === DomainAvailability.AVAILABLE;
}
