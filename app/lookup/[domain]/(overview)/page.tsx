import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { FC, ReactElement } from 'react';
import { getDomain, getPublicSuffix } from 'tldts';
import whoiser from 'whoiser';

import { Alert, AlertTitle } from '@/components/ui/alert';

import DnsRecordsWidget, {
  DnsRecordType,
} from '@/app/lookup/[domain]/(overview)/_components/DnsRecordsWidget';
import DomainDatesWidget from '@/app/lookup/[domain]/(overview)/_components/DomainDatesWidget';
import DomainlabelWidget from '@/app/lookup/[domain]/(overview)/_components/DomainlabelWidget';
import DomainOwnerInfoWidget from '@/app/lookup/[domain]/(overview)/_components/DomainOwnerInfoWidget';
import NameserverWidget from '@/app/lookup/[domain]/(overview)/_components/NameserverWidget';
import TechnologiesWidget from '@/app/lookup/[domain]/(overview)/_components/TechnologiesWidget';
import { bigquery } from '@/lib/bigquery';
import { isValidLookupDomain } from '@/lib/utils';
import { isDomainAvailable } from '@/lib/whois';

import DomainNotRegistered from '../../../../components/DomainNotRegistered';

export const fetchCache = 'default-no-store';

const maskIpLastOctet = (ip: string | null): string | null => {
  if (!ip) return null;
  const trimmedIp = ip.trim();
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Pattern.test(trimmedIp)) return null;

  const octets = trimmedIp.split('.').map((part) => Number(part));
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255))
    return null;

  return `${octets[0]}.${octets[1]}.${octets[2]}.0`;
};

interface LookupDomainProps {
  params: Promise<{
    domain: string;
  }>;
}

export const generateMetadata = async ({
  params: params,
}: LookupDomainProps): Promise<Metadata> => {
  const { domain } = await params;
  return {
    openGraph: {
      url: `/lookup/${domain}`,
    },
    alternates: {
      canonical: `/lookup/${domain}`,
    },
  };
};

const LookupDomain: FC<LookupDomainProps> = async ({
  params: params,
}): Promise<ReactElement> => {
  const { domain } = await params;
  const baseDomain = getDomain(domain);
  const publicSuffix = getPublicSuffix(domain);
  const requestHeaders = await headers();
  const clientIp =
    requestHeaders.get('cf-connecting-ip') ||
    requestHeaders.get('x-real-ip') ||
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null;
  const clientIpMasked = maskIpLastOctet(clientIp);

  if (!baseDomain || !isValidLookupDomain(baseDomain)) return notFound();

  if (bigquery) {
    bigquery
      .insertRows({
        datasetName: process.env.BIGQUERY_DATASET!,
        tableName: 'domain_lookups',
        rows: [
          {
            domain: domain,
            baseDomain: baseDomain,
            publicSuffix: publicSuffix,
            ip: clientIpMasked,
            timestamp: '' + new Date().toISOString(),
          },
        ],
      })
      .catch((error) => {
        if ('errors' in error) {
          for (const err of error.errors) {
            console.error(err);
          }
        } else {
          console.error(error);
        }
      });
  }

  let whoisResult;
  let whoisError: string | null = null;
  try {
    // @ts-ignore
    whoisResult = whoiser.firstResult(
      await whoiser(baseDomain, {
        timeout: 3000,
      })
    );
  } catch (error: any) {
    if (
      typeof error?.message === 'string' &&
      error.message.includes('TLD for') &&
      error.message.includes('not supported')
    ) {
      whoisResult = null;
      whoisError = 'WHOIS data is not available for this TLD!';
    } else {
      console.error('Error fetching whois data:', error);
    }
  }

  if (await isDomainAvailable(baseDomain)) {
    return <DomainNotRegistered />;
  }

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {whoisError && (
        <div className="col-span-full">
          <Alert variant="default">
            <AlertTitle>WHOIS Information</AlertTitle>
            <span>{whoisError}</span>
          </Alert>
        </div>
      )}
      {whoisResult && (
        <>
          <DomainDatesWidget whoisData={whoisResult} />
          <DomainOwnerInfoWidget whoisData={whoisResult} />
        </>
      )}
      <DnsRecordsWidget type={DnsRecordType.A} domain={domain} />
      {whoisResult && (
        <NameserverWidget whoisData={whoisResult} domain={domain} />
      )}
      <DnsRecordsWidget type={DnsRecordType.MX} domain={domain} />
      {whoisResult && <DomainlabelWidget whoisData={whoisResult} />}
      <TechnologiesWidget domain={domain} />
    </div>
  );
};

export default LookupDomain;
