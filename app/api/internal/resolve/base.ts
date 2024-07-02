import { env } from '@/env';
import AlibabaDoHResolver from '@/lib/resolvers/AlibabaDoHResolver';
import CloudflareDoHResolver from '@/lib/resolvers/CloudflareDoHResolver';
import { RECORD_TYPES, RecordType } from '@/lib/resolvers/DnsResolver';
import GoogleDoHResolver from '@/lib/resolvers/GoogleDoHResolver';

if (env.ENVIRONMENT === 'production' && !env.INTERNAL_API_SECRET) {
  throw new Error('INTERNAL_API_SECRET is required in production');
}

export const handler = async (request: Request) => {
  if (
    env.INTERNAL_API_SECRET &&
    env.INTERNAL_API_SECRET !== request.headers.get('authorization')
  ) {
    return Response.json(
      {
        error: true,
        message: 'Unauthorized',
      },
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const resolverName = searchParams.get('resolver');
  const types = searchParams.getAll('type');
  const domain = searchParams.get('domain');

  if (!resolverName || !types.length || !domain) {
    return Response.json(
      {
        error: true,
        message: '"resolver", "type" and "domain" params are required',
      },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  if (!['cloudflare', 'google', 'alibaba'].includes(resolverName)) {
    return Response.json(
      {
        error: true,
        message: `Invalid resolver "${resolverName}"`,
      },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  for (const type of types) {
    // @ts-expect-error
    if (!RECORD_TYPES.includes(type)) {
      return Response.json(
        {
          error: true,
          message: `Invalid record type "${type}"`,
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  const resolver =
    resolverName === 'google'
      ? new GoogleDoHResolver()
      : resolverName === 'cloudflare'
        ? new CloudflareDoHResolver()
        : new AlibabaDoHResolver();
  const records = Object.fromEntries(
    await Promise.all(
      types.map(async (type) => [
        type,
        await resolver.resolveRecordType(domain, type as RecordType),
      ])
    )
  );

  return Response.json(records);
};
