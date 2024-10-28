import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FC, ReactElement } from 'react';
import { getDomain, getPublicSuffix } from 'tldts';
import whoiser from 'whoiser';

import DnsRecordsWidget, {
  DnsRecordType,
} from '@/app/lookup/[domain]/(overview)/_components/DnsRecordsWidget';
import DomainDatesWidget from '@/app/lookup/[domain]/(overview)/_components/DomainDatesWidget';
import DomainlabelWidget from '@/app/lookup/[domain]/(overview)/_components/DomainlabelWidget';
import DomainOwnerInfoWidget from '@/app/lookup/[domain]/(overview)/_components/DomainOwnerInfoWidget';
import NameserverWidget from '@/app/lookup/[domain]/(overview)/_components/NameserverWidget';
import TechnologiesWidget from '@/app/lookup/[domain]/(overview)/_components/TechnologiesWidget';
import { bigquery } from '@/lib/bigquery';
import { env } from '@/env';
import { isDomainAvailable } from '@/lib/whois';

import DomainNotRegistered from '../../../../components/DomainNotRegistered';

export const fetchCache = 'default-no-store';

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

  if (!baseDomain) return notFound();

  if (bigquery) {
    bigquery
      .insertRows({
        datasetName: env.BIGQUERY_DATASET!,
        tableName: 'domain_lookups',
        rows: [
          {
            domain: domain,
            baseDomain: baseDomain,
            publicSuffix: publicSuffix,
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
  try {
    // @ts-ignore
    whoisResult = whoiser.firstResult(
      await whoiser(baseDomain, {
        timeout: 3000,
      })
    );
  } catch (error) {
    console.error('Error fetching whois data:', error);
  }

  if (await isDomainAvailable(baseDomain)) {
    return <DomainNotRegistered />;
  }

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
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
