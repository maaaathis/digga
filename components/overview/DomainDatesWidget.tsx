import React from 'react';
import whoiser from 'whoiser';

import DashboardItem from './DashboardItem';

interface Props {
  domain: string;
}

const DomainDatesWidget: React.FC<Props> = async ({
  domain,
}): Promise<React.ReactElement | null> => {
  // @ts-ignore
  const whoisResult = whoiser.firstResult(
    await whoiser(domain, {
      timeout: 3000,
    })
  );

  if (
    !whoisResult['Created Date'] &&
    !whoisResult['Updated Date'] &&
    !whoisResult['Expiry Date']
  )
    return null;

  const dateProperties = ['Created Date', 'Updated Date', 'Expiry Date'];
  const presentDates = dateProperties.filter(
    (property) => whoisResult[property]
  );
  const colSpan = presentDates.length >= 2 ? 'col-span-4' : 'col-span-2';

  return (
    <DashboardItem title="Dates" className={colSpan}>
      <div className="flex flex-row justify-around gap-4">
        {whoisResult['Created Date'] && (
          <div className="flex flex-col text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {new Date(whoisResult['Created Date']).toLocaleDateString(
                'en-US',
                {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </p>
            <p className="text-lg font-light text-slate-900 dark:text-slate-100">
              {new Date(whoisResult['Created Date']).toLocaleTimeString(
                'en-US',
                {
                  hour: 'numeric',
                  minute: 'numeric',
                }
              )}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
              Domain registered
            </p>
          </div>
        )}
        {whoisResult['Updated Date'] && (
          <div className="flex flex-col text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {new Date(whoisResult['Updated Date']).toLocaleDateString(
                'en-US',
                {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </p>
            <p className="text-lg font-light text-slate-900 dark:text-slate-100">
              {new Date(whoisResult['Updated Date']).toLocaleTimeString(
                'en-US',
                {
                  hour: 'numeric',
                  minute: 'numeric',
                }
              )}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
              Domain updated
            </p>
          </div>
        )}
        {whoisResult['Expiry Date'] && (
          <div className="flex flex-col text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {new Date(whoisResult['Expiry Date']).toLocaleDateString(
                'en-US',
                {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </p>
            <p className="text-lg font-light text-slate-900 dark:text-slate-100">
              {new Date(whoisResult['Expiry Date']).toLocaleTimeString(
                'en-US',
                {
                  hour: 'numeric',
                  minute: 'numeric',
                }
              )}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
              Domain expiration
            </p>
          </div>
        )}
      </div>
    </DashboardItem>
  );
};

export default DomainDatesWidget;
