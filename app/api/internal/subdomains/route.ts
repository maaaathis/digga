import { CloudflareDoHResolver } from '@/lib/resolvers/cloudflare';
import { findSubdomains } from '@/lib/subdomains';

export interface SubdomainsResponse {
  results: {
    domain: string;
    firstSeen: string;
    stillExists: boolean;
  }[];
  isTruncated: boolean;
  RESULTS_LIMIT: number;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return Response.json(
      { error: true, message: 'No domain provided' },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const subdomainsResult = await findSubdomains(
      domain,
      new CloudflareDoHResolver(),
      5
    );
    return Response.json(subdomainsResult);
  } catch (error) {
    return Response.json(
      { error: true, message: 'Error fetching whois summary' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
