import { isbot } from 'isbot';
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

export const isUserBot = (headers: ReadonlyHeaders) => {
  const userAgent = headers.get('user-agent');
  const isBot = !userAgent || isbot(userAgent);
  return { isBot, userAgent };
};
