'use client';

import React from 'react';

import DashboardItem from './DashboardItem';

interface Props {
  // whoiser doesn't have a proper type definition :c
  whoisData: any;
}

const isDateValid = (date: string): boolean => {
  return (
    Object.prototype.toString.call(date) === '[object Date]' &&
    !isNaN(new Date(date).getTime())
  );
};

const DomainDatesWidget: React.FC<Props> = ({
  whoisData,
}): React.ReactElement | null => {
  const whoisResult = whoisData;
  if (
    !whoisResult['Created Date'] &&
    !whoisResult['Updated Date'] &&
    !whoisResult['Expiry Date']
  )
    return null;

  if (
    !isDateValid(whoisResult['Created Date']) &&
    !isDateValid(whoisResult['Updated Date']) &&
    !isDateValid(whoisResult['Expiry Date'])
  )
    return null;

  const dateProperties = ['Created Date', 'Updated Date', 'Expiry Date'];
  const presentDates = dateProperties.filter(
    (property) => whoisResult[property]
  );
  const colSpan = presentDates.length >= 2 ? 'col-span-4' : 'col-span-2';

  return (
    <DashboardItem title="Dates" className={colSpan}>
      <div className="flex h-full">
        <div className="m-auto flex flex-col justify-around gap-6 sm:flex-row sm:gap-4">
          {isDateValid(whoisResult['Created Date']) && (
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
          {isDateValid(whoisResult['Updated Date']) && (
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
          {isDateValid(whoisResult['Expiry Date']) && (
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
      </div>
    </DashboardItem>
  );
};

export default DomainDatesWidget;
