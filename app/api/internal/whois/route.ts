import whoiser, { WhoisSearchResult } from 'whoiser';

import { isValidLookupDomain, normalizeDomain } from '@/lib/utils';

export type WhoisDataResponse = {
  registrar: string | null;
  createdAt: string | null;
  dnssec: string | null;
  isDNSSECSigned?: boolean;
};

export type WhoisSummaryErrorResponse = { error: true; message: string };

const getWhoisData = async (domain: string): Promise<WhoisDataResponse> => {
  domain = normalizeDomain(domain);

  //TODO: Add more return values
  if (!isValidLookupDomain(domain)) {
    return {
      registrar: null,
      createdAt: null,
      dnssec: null,
      isDNSSECSigned: false,
    };
  }

  try {
    const results = await whoiser(domain, {
      timeout: 5000,
    });

    const resultsKey = Object.keys(results).find(
      // @ts-expect-error
      (key) => !('error' in results[key])
    );
    if (!resultsKey) {
      throw new Error('No valid results found for domain ' + domain);
    }
    const firstResult = results[resultsKey] as WhoisSearchResult;

    const dnssecState =
      firstResult['DNSSEC']?.toString() || firstResult['Dnskey']?.toString();

    return {
      registrar: firstResult['Registrar']?.toString(),
      createdAt:
        firstResult && 'Created Date' in firstResult
          ? new Date(firstResult['Created Date'].toString()).toLocaleDateString(
              'en-US'
            )
          : null,
      dnssec: dnssecState,
      isDNSSECSigned: !!(dnssecState && dnssecState !== 'unsigned'),
    };
  } catch (error) {
    console.error(error);
    return {
      registrar: null,
      createdAt: null,
      dnssec: null,
      isDNSSECSigned: false,
    };
  }
};

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return Response.json(
      { error: true, message: 'No domain provided' },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const summary = await getWhoisData(domain);
    return Response.json(summary);
  } catch (error) {
    return Response.json(
      { error: true, message: 'Error fetching whois summary' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
