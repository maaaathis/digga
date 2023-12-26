import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import whoiser from 'whoiser';

import { Badge } from '@/components/ui/badge';

import DashboardItem from './DashboardItem';

interface Props {
  domain: string;
}

const DomainOwnerInfoWidget: React.FC<Props> = async ({
  domain,
}): Promise<React.ReactElement | null> => {
  // @ts-ignore
  const whoisResult = whoiser.firstResult(
    await whoiser(domain, {
      timeout: 3000,
    })
  );

  if (!whoisResult['Registrant Organization'] && !whoisResult['Registrar'])
    return null;

  return (
    <div className="col-span-2 flex flex-col gap-4">
      {whoisResult['Registrant Organization'] && (
        <DashboardItem
          title="Domain Owner"
          secondaryElement={
            <ReactCountryFlag
              countryCode={whoisResult['Registrant Country']}
              svg
              style={{
                fontSize: '1.75em',
                lineHeight: '1.75em',
                borderRadius: '20%',
              }}
            />
          }
        >
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {whoisResult['Registrant Organization']}
          </p>
        </DashboardItem>
      )}
      {!whoisResult['Registrant Organization'] &&
        whoisResult['Registrant Country'] && (
          <DashboardItem
            title="Domain Owner Region"
            secondaryElement={
              <ReactCountryFlag
                countryCode={whoisResult['Registrant Country']}
                svg
                style={{
                  fontSize: '1.75rem',
                  lineHeight: '1.75rem',
                  borderRadius: '25%',
                }}
              />
            }
          >
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {whoisResult['Registrant State/Province']}
            </p>
          </DashboardItem>
        )}
      {whoisResult['Registrar'] && (
        <DashboardItem title="Domain Registry">
          <a
            href={whoisResult['Registrar URL']}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-xl font-bold text-slate-900 decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:text-slate-100 dark:decoration-slate-300"
          >
            {whoisResult['Registrar']}
          </a>
        </DashboardItem>
      )}
    </div>
  );
};

export default DomainOwnerInfoWidget;
