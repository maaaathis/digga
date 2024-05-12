import isValidDomain from 'is-valid-domain';

import { lookupCerts } from './certs';
import type { DnsResolver } from './resolvers/base';
import { deduplicate } from './utils';

export const findSubdomains = async (
  domain: string,
  resolver: DnsResolver,
  resultLimit?: number
) => {
  const certs = await lookupCerts(domain);

  const RESULTS_LIMIT = resultLimit || 500;

  const issuedCerts = certs.map((cert) => ({
    date: new Date(cert.entry_timestamp),
    domains: [cert.common_name, ...cert.name_value.split(/\n/g)],
  }));

  const uniqueDomains = deduplicate(issuedCerts.flatMap((r) => r.domains))
    .filter((domain) => isValidDomain(domain))
    .filter((d) => d.endsWith(`.${domain}`));

  const results = await Promise.all(
    uniqueDomains.slice(0, RESULTS_LIMIT).map(async (domain) => {
      const records = await resolver.resolveRecordType(domain, 'A');
      const hasRecords = records.length > 0;

      return {
        domain,
        firstSeen: issuedCerts
          .filter((c) => c.domains.includes(domain))
          .toSorted((a, b) => a.date.getTime() - b.date.getTime())[0].date,
        stillExists: hasRecords,
      };
    })
  );

  const sortedResults = results.toSorted(
    (a, b) => b.firstSeen.getTime() - a.firstSeen.getTime()
  );

  return {
    results: sortedResults,
    isTruncated: uniqueDomains.length > RESULTS_LIMIT,
    RESULTS_LIMIT,
  };
};
