import whoiser, { WhoisSearchResult } from 'whoiser';

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

export async function isAvailable(domain: string): Promise<string> {
  domain = domain.toLowerCase();
  //accept also subdomains
  if (domain.includes('.')) {
    domain = domain.split('.').slice(-2).join('.');
  }

  const domainWhois = await whoiser(domain, { follow: 1 });

  // @ts-ignore
  const firstDomainWhois = whoiser.firstResult(domainWhois);
  const firstTextLine = (firstDomainWhois.text[0] || '').toLowerCase();

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

  return domainAvailability;
}
