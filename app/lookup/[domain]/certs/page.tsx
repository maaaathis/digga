import { isbot } from 'isbot';
import { ExternalLink, ShieldAlertIcon } from 'lucide-react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import React, { FC, ReactElement } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import DomainLink from '@/components/DomainLink';
import StyledError from '@/components/StyledError';

type CertsData = {
  issuer_ca_id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  id: number;
  entry_timestamp: string;
  not_before: string;
  not_after: string;
  serial_number: string;
}[];

export const runtime = 'edge';
export const preferredRegion = 'lhr1';

export const generateMetadata = async ({
  params: params,
}: CertsResultsPageProps): Promise<Metadata> => {
  const { domain } = await params;
  return {
    openGraph: {
      url: `/lookup/${domain}/certs`,
    },
    alternates: {
      canonical: `/lookup/${domain}/certs`,
    },
  };
};

const lookupCerts = async (domain: string): Promise<CertsData> => {
  const response = await fetch(
    'https://crt.sh?' +
      new URLSearchParams({
        Identity: domain,
        output: 'json',
      }),
    {
      next: {
        revalidate: 60 * 60,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch certs');
  }

  return await response.json();
};

type CertsResultsPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

const CertsResultsPage: FC<CertsResultsPageProps> = async ({
  params: params,
}): Promise<ReactElement> => {
  const { domain } = await params;
  const header = await headers();

  const userAgent = header.get('user-agent');
  const isBotRequest = !userAgent || isbot(userAgent);

  if (isBotRequest) {
    return (
      <StyledError
        title="Bot or crawler detected!"
        icon={<ShieldAlertIcon className="h-16 w-16" />}
        description="To protect our infrastructure, this page is not available for bots or crawlers. But don't be sad, there's nothing to crawl here anyway."
      />
    );
  }

  const certRequests = [await lookupCerts(domain)];

  const hasParentDomain = domain.split('.').filter(Boolean).length > 2;
  if (hasParentDomain) {
    const parentDomain = domain.split('.').slice(1).join('.');
    certRequests.push(await lookupCerts(`*.${parentDomain}`));
  }

  const certs = await Promise.all(certRequests).then((responses) =>
    responses
      .flat()
      .sort(
        (a, b) =>
          new Date(b.entry_timestamp).getTime() -
          new Date(a.entry_timestamp).getTime()
      )
  );

  if (!certs.length) {
    return (
      <p className="mt-8 text-center text-muted-foreground">
        No issued certificates found!
      </p>
    );
  }

  return (
    <>
      {hasParentDomain && (
        <p className="my-2 text-sm text-muted-foreground">
          <span className="font-bold">Note:</span> This domain has a parent
          domain. The following certificates were issued for both this domain
          and its parent domain.
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-0">Logged At</TableHead>
            <TableHead>Not Before</TableHead>
            <TableHead>Not After</TableHead>
            <TableHead>Common Name</TableHead>
            <TableHead>Matching Identities</TableHead>
            <TableHead>Issuer Name</TableHead>
            <TableHead className="pr-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {certs.map((cert) => (
            <TableRow key={cert.id} className="hover:bg-transparent">
              <TableCell className="pl-0">{cert.entry_timestamp}</TableCell>
              <TableCell>{cert.not_before}</TableCell>
              <TableCell>{cert.not_after}</TableCell>
              <TableCell>
                <DomainLink domain={cert.common_name} />
              </TableCell>

              <TableCell>
                {cert.name_value.split(/\n/g).map((value, index) => (
                  <>
                    {index !== 0 && <br />}
                    <DomainLink domain={value} />
                  </>
                ))}
              </TableCell>
              <TableCell>{cert.issuer_name}</TableCell>
              <TableCell className="pr-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`https://crt.sh/?id=${cert.id}`}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                        className="mx-auto flex h-9 w-9 justify-center rounded-lg hover:cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <ExternalLink className="m-auto h-4 w-4 text-black dark:text-white" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>View certificate details</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-5 text-xs text-opacity-80">
        Data provided by{' '}
        <Link
          href={
            hasParentDomain
              ? `https://crt.sh?q=${domain.split('.').slice(1).join('.')}`
              : `https://crt.sh?q=${domain}`
          }
          target="_blank"
          rel="noreferrer noopener"
          className="cursor-pointer select-none decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:decoration-slate-300"
        >
          Sectigo&apos;s crt.sh
        </Link>
        .
      </p>
    </>
  );
};

export default CertsResultsPage;
