import * as React from 'react';

export default async function OverviewSecurity({ domain }) {
  let returnValue = [];

  const domainFormatted = encodeURIComponent(`https://${domain}`);

  const robotsTXTcheck = await fetch(
    `https://stage.digga.dev/api/scan/?domain=${domainFormatted}&file=${encodeURIComponent(
      'robots.txt'
    )}`,
    { next: { revalidate: 10 } }
  );
  const robotsTXT = await robotsTXTcheck.json();

  const securityTXTcheck = await fetch(
    `https://stage.digga.dev/api/scan/?domain=${domainFormatted}&file=${encodeURIComponent(
      'security.txt'
    )}`,
    { next: { revalidate: 10 } }
  );
  const securityTXT = await securityTXTcheck.json();

  if (robotsTXT.fileResonse != 404) {
    returnValue.push(
      <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <svg
          className="h-1.5 w-1.5 fill-green-400"
          viewBox="0 0 6 6"
          aria-hidden="true"
        >
          <circle cx={3} cy={3} r={3} />
        </svg>
        robots.txt
      </span>
    );
  } else {
    returnValue.push(
      <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <svg
          className="h-1.5 w-1.5 fill-red-400"
          viewBox="0 0 6 6"
          aria-hidden="true"
        >
          <circle cx={3} cy={3} r={3} />
        </svg>
        robots.txt
      </span>
    );
  }

  if (securityTXT.fileResonse != 404) {
    returnValue.push(
      <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <svg
          className="h-1.5 w-1.5 fill-green-400"
          viewBox="0 0 6 6"
          aria-hidden="true"
        >
          <circle cx={3} cy={3} r={3} />
        </svg>
        security.txt
      </span>
    );
  } else {
    returnValue.push(
      <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <svg
          className="h-1.5 w-1.5 fill-red-400"
          viewBox="0 0 6 6"
          aria-hidden="true"
        >
          <circle cx={3} cy={3} r={3} />
        </svg>
        security.txt
      </span>
    );
  }

  if (robotsTXT.hsts != 'false') {
    returnValue.push(
      <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <svg
          className="h-1.5 w-1.5 fill-green-400"
          viewBox="0 0 6 6"
          aria-hidden="true"
        >
          <circle cx={3} cy={3} r={3} />
        </svg>
        HSTS
      </span>
    );
  } else {
    returnValue.push(
      <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <svg
          className="h-1.5 w-1.5 fill-red-400"
          viewBox="0 0 6 6"
          aria-hidden="true"
        >
          <circle cx={3} cy={3} r={3} />
        </svg>
        HSTS
      </span>
    );
  }

  return (
    <div>
      {returnValue.map((element, index) => (
        <React.Fragment key={index} className="mx-1 my-2">
          {element}
        </React.Fragment>
      ))}
    </div>
  );
}
