import whoiser, { WhoisSearchResult } from 'whoiser';

export default async function whois(domain: string): Promise<any> {
  return await whoiser(domain);
}

export async function isAvailable(domain: string): Promise<string> {
  const domainWhois = await whoiser(domain, { follow: 1 });

  const firstDomainWhois = getFirstResult(domainWhois);
  const firstTextLine = (firstDomainWhois.text[0] || '').toLowerCase();

  let domainAvailability = 'unknown';

  if (firstTextLine.includes('reserved')) {
    domainAvailability = 'reserved';
  } else if (
    firstDomainWhois['Domain Name'] &&
    firstDomainWhois['Domain Name'].toLowerCase() === domain
  ) {
    domainAvailability = 'registered';
  } else if (firstTextLine.includes(`no match for "${domain}"`)) {
    domainAvailability = 'available';
  }

  return domainAvailability;
}

function getFirstResult(whoisSearchResult: WhoisSearchResult): any {
  if (Array.isArray(whoisSearchResult.results) && whoisSearchResult.results.length > 0) {
    return whoisSearchResult.results[0];
  }
  return {};
}
