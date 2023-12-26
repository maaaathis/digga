import { XSquareIcon } from 'lucide-react';
import React from 'react';
import whoiser from 'whoiser';

import { Badge } from '@/components/ui/badge';

import DashboardItem from './DashboardItem';

interface Props {
  domain: string;
}

const NameserverWidget: React.FC<Props> = async ({
  domain,
}): Promise<React.ReactElement> => {
  // @ts-ignore
  const whoisResult = whoiser.firstResult(
    await whoiser(domain, {
      timeout: 3000,
    })
  );

  return (
    <DashboardItem title="Nameserver">
      <div className="flex h-full">
        {whoisResult['Name Server'] &&
        Object.values(whoisResult['Name Server']).length === 0 ? (
          <div className="m-auto">
            <XSquareIcon className="h-10 w-10 text-black dark:text-white" />
          </div>
        ) : (
          <ul className="list-inside list-disc text-lg font-medium text-slate-900 dark:text-slate-100">
            {Object.values(whoisResult['Name Server']).map((ns) => {
              return (
                <li key={ns as string}>
                  <a
                    className="cursor-pointer decoration-slate-700 decoration-dotted underline-offset-4 hover:underline dark:decoration-slate-300"
                    href={`/lookup/${ns as string}`}
                  >
                    {ns as string}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardItem>
  );
};

export default NameserverWidget;
