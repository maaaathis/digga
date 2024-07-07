import { type NextRequest, NextResponse } from 'next/server';

import { isUserBot } from '@/lib/bot';

export const middleware = async (request: NextRequest) => {
  if (process.env.ALLOWED_BOTS) {
    const { isBot, userAgent } = isUserBot(request.headers);
    if (isBot) {
      const isAllowedBot =
        userAgent &&
        (() => {
          try {
            const allowedBots = JSON.parse(process.env.ALLOWED_BOTS || '[]');
            return (
              Array.isArray(allowedBots) &&
              allowedBots.some((bot) =>
                userAgent.toLowerCase().includes(bot.toLowerCase())
              )
            );
          } catch (error) {
            return false;
          }
        })();

      if (!isAllowedBot) {
        return new Response('Forbidden', { status: 403 });
      }
    }
  }

  return NextResponse.next();
};
export const config = {
  matcher: [
    {
      source: '/lookup/:domain*',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
