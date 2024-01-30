'use client';

import React from 'react';

import DashboardItem from './DashboardItem';

interface Props {
  // whoiser doesn't have a proper type definition :c
  whoisData: any;
}

function formatDate(dateString: any): string | undefined {
  return dateString
    ? new Date(dateString).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;
}

function formatTime(dateString: any): string | undefined {
  return dateString
    ? new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
      })
    : undefined;
}

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

  const dateProperties = ['Created Date', 'Updated Date', 'Expiry Date'];
  const presentDates = dateProperties.filter(
    (property) => whoisResult[property]
  );

  const createdDate = formatDate(whoisResult['Created Date']);
  const createdTime = formatTime(whoisResult['Created Date']);

  const updatedDate = formatDate(whoisResult['Updated Date']);
  const updatedTime = formatTime(whoisResult['Updated Date']);

  const expiryDate = formatDate(whoisResult['Expiry Date']);
  const expiryTime = formatTime(whoisResult['Expiry Date']);

  const colSpan = presentDates.length >= 2 ? 'col-span-4' : 'col-span-2';

  return (
    <DashboardItem title="Dates" className={colSpan}>
      <div className="flex h-full">
        <div className="m-auto flex flex-col justify-around gap-6 sm:flex-row sm:gap-4">
          {whoisResult['Created Date'] && createdDate !== 'Invalid Date' && (
            <div className="flex flex-col text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {createdDate}
              </p>
              {createdTime && (
                <p className="text-lg font-light text-slate-900 dark:text-slate-100">
                  {createdTime}
                </p>
              )}
              <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                Domain registered
              </p>
            </div>
          )}
          {whoisResult['Updated Date'] && updatedDate !== 'Invalid Date' && (
            <div className="flex flex-col text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {updatedDate}
              </p>
              {updatedTime && (
                <p className="text-lg font-light text-slate-900 dark:text-slate-100">
                  {updatedTime}
                </p>
              )}
              <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                Domain updated
              </p>
            </div>
          )}
          {whoisResult['Expiry Date'] && expiryDate !== 'Invalid Date' && (
            <div className="flex flex-col text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {expiryDate}
              </p>
              {expiryTime && (
                <p className="text-lg font-light text-slate-900 dark:text-slate-100">
                  {expiryTime}
                </p>
              )}
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
