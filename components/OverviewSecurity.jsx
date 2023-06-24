import * as React from 'react';
import { CheckIcon, XIcon } from 'lucide-react';

export default async function OverviewSecurity({ domain }) {
  let returnValue = [];

  async function getRobotsTXTData(domain) {
    let domainFormatted = encodeURIComponent(`https://${domain}`);

    console.log(encodeURIComponent(`https://${domain}`));

    let robotsTXTcheck = await fetch(
      `https://stage.digga.dev/api/scan/?domain=${domainFormatted}&file=${encodeURIComponent(
        'robots.txt'
      )}`,
      { next: { revalidate: 20 } }
    );
    let robotsTXT = await robotsTXTcheck.json();
    if (
      (await robotsTXT.fileResponse) == 301 ||
      (await robotsTXT.fileResponse) == 404
    ) {
      domainFormatted = encodeURIComponent(`https://www.${domain}`);
      robotsTXTcheck = await fetch(
        `https://stage.digga.dev/api/scan/?domain=${domainFormatted}&file=${encodeURIComponent(
          'robots.txt'
        )}`,
        { next: { revalidate: 20 } }
      );
      robotsTXT = await robotsTXTcheck.json();
      if ((await robotsTXT.fileResponse) == 301) {
        return '404';
      } else {
        return robotsTXT;
      }
    } else {
      return robotsTXT;
    }
  }

  async function getSecurityTXTData(domain) {
    let domainFormatted = encodeURIComponent(`https://${domain}`);

    let securityTXTcheck = await fetch(
      `https://stage.digga.dev/api/scan/?domain=${domainFormatted}&file=${encodeURIComponent(
        'security.txt'
      )}`,
      { next: { revalidate: 20 } }
    );
    let securityTXT = await securityTXTcheck.json();
    if (
      (await securityTXT.fileResponse) == 301 ||
      (await securityTXT.fileResponse) == 404
    ) {
      domainFormatted = encodeURIComponent(`https://www.${domain}`);
      securityTXTcheck = await fetch(
        `https://stage.digga.dev/api/scan/?domain=${domainFormatted}&file=${encodeURIComponent(
          'security.txt'
        )}`,
        { next: { revalidate: 20 } }
      );
      securityTXT = await securityTXTcheck.json();
      if ((await securityTXT.fileResponse) == 301) {
        return '404';
      } else {
        return securityTXT;
      }
    } else {
      return securityTXT;
    }
  }

  async function getHSTSState(domain) {
    let domainFormatted = encodeURIComponent(`https://${domain}`);

    let hstsCheck = await fetch(
      `https://stage.digga.dev/api/scan/?domain=${domainFormatted}&file=${encodeURIComponent(
        'robots.txt'
      )}`,
      { next: { revalidate: 20 } }
    );
    let hsts = await hstsCheck.json();
    return hsts.hsts;
  }

  const robotsData = await getRobotsTXTData(domain);
  const securityData = await getSecurityTXTData(domain);
  const hstsData = await getHSTSState(domain);

  if (robotsData.fileResponse != 404) {
    returnValue.push(
      <a
        href={robotsData.domain + '/' + robotsData.file}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-1 my-1 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800"
      >
        <CheckIcon className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
        robots.txt
      </a>
    );
  } else {
    returnValue.push(
      <span className="mx-1 my-1 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <XIcon className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
        robots.txt
      </span>
    );
  }

  if (securityData.fileResponse != 404) {
    returnValue.push(
      <a
        href={securityData.domain + '/' + securityData.file}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-1 my-1 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800"
      >
        <CheckIcon className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
        security.txt
      </a>
    );
  } else {
    returnValue.push(
      <span className="mx-1 my-1 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <XIcon className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
        security.txt
      </span>
    );
  }

  if (hstsData != 'false') {
    returnValue.push(
      <span className="mx-1 my-1 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <CheckIcon className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
        HSTS
      </span>
    );
  } else {
    returnValue.push(
      <span className="mx-1 my-1 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-800">
        <XIcon className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
        HSTS
      </span>
    );
  }

  return (
    <div>
      {returnValue.map((element, index) => (
        <React.Fragment key={index}>{element}</React.Fragment>
      ))}
    </div>
  );
}
