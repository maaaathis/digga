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
    const errorMessage = error?.message || String(error);

    // TLD not supported
    if (
      errorMessage.includes('TLD for') &&
      errorMessage.includes('not supported')
    ) {
      console.warn(`WHOIS: TLD not supported for ${domain}`);
      return null;
    }

    // whoiser stream/transform algorithm error (Node.js internal error)
    if (
      errorMessage.includes('transformAlgorithm') ||
      errorMessage.includes('kState')
    ) {
      console.warn(`WHOIS: Stream processing error for ${domain}`);
      return null;
    }

    // Connection timeouts
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ETIMEDOUT')
    ) {
      console.warn(`WHOIS: Connection timeout for ${domain}`);
      return null;
    }

    // Generic stream errors
    if (errorMessage.includes('stream') || errorMessage.includes('Transform')) {
      console.warn(`WHOIS: Stream error for ${domain}`);
      return null;
    }

    console.error('Error in whois():', error);
    return null;
  }
}

function firstResult(obj: any) {
  if (!obj || typeof obj !== 'object') return null;
  const keys = Object.keys(obj);
  if (keys.length === 0) return null;
  return obj[keys[0]];
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
    const errorMessage = error?.message || String(error);

    // TLD not supported
    if (
      errorMessage.includes('TLD for') &&
      errorMessage.includes('not supported')
    ) {
      console.warn(`WHOIS: TLD not supported for ${domain}`);
      return DomainAvailability.UNKNOWN;
    }

    // Stream errors including transformAlgorithm
    if (
      errorMessage.includes('transformAlgorithm') ||
      errorMessage.includes('kState') ||
      errorMessage.includes('stream') ||
      errorMessage.includes('Transform')
    ) {
      console.warn(
        `WHOIS: Stream error while checking availability for ${domain}`
      );
      return DomainAvailability.UNKNOWN;
    }

    // Connection errors
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ETIMEDOUT')
    ) {
      console.warn(
        `WHOIS: Connection timeout while checking availability for ${domain}`
      );
      return DomainAvailability.UNKNOWN;
    }

    console.error('Error in isAvailable:', error);
    return DomainAvailability.UNKNOWN;
  }

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
