import dns from 'dns';
import { promisify } from 'util';
import isIP from 'validator/lib/isIP';

import { getIpDetails, getIpGreenDetails } from '@/lib/ips';

export type IpLookupResponse = {
  city: string;
  country: string;
  isp: string;
  lat: number;
  lon: number;
  org: string;
  region: string;
  reverse: string[];
  timezone: string;
  greenHosted: boolean;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  if (!ip || !isIP(ip)) {
    return new Response(
      JSON.stringify({
        error: true,
        message: '"ip" param missing or invalid',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  let reverse: string[] = [];
  try {
    reverse = await promisify(dns.reverse)(ip);
  } catch (error) {
    console.error(error);
  }

  const [data, isGreenHosted] = await Promise.all([
    getIpDetails(ip),
    getIpGreenDetails(ip),
  ]);

  return new Response(
    JSON.stringify({
      reverse: reverse,
      isp: data.isp,
      org: data.org,
      country: data.country,
      region: data.regionName,
      city: data.city,
      timezone: data.timezone,
      lat: data.lat,
      lon: data.lon,
      greenHosted: isGreenHosted,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
