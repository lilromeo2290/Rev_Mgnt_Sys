import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for Ghana Post GPS (Digital Address) lookup.
 * Tries multiple endpoint variations to maximize success.
 * Avoids browser CORS by calling server-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  // Multiple endpoint strategies to try
  const endpoints = [
    // Strategy 1: ghanapostgps.com with /api/coordinates
    {
      url: `https://ghanapostgps.com/api/coordinates?lat=${lat}&long=${lon}`,
      extract: (data: any) =>
        data?.data?.address ||
        data?.address ||
        data?.Address ||
        data?.data?.Address ||
        '',
    },
    // Strategy 2: ghanapostgps.com with /api/address
    {
      url: `https://ghanapostgps.com/api/address?lat=${lat}&long=${lon}`,
      extract: (data: any) =>
        data?.data?.address ||
        data?.address ||
        data?.data?.Address ||
        data?.Address ||
        '',
    },
    // Strategy 3: ghanapostgps.com with JSON body POST
    {
      url: `https://ghanapostgps.com/api/coordinates`,
      method: 'POST' as const,
      body: JSON.stringify({ lat: parseFloat(lat), long: parseFloat(lon) }),
      extract: (data: any) =>
        data?.data?.address ||
        data?.address ||
        data?.data?.Address ||
        data?.Address ||
        '',
    },
    // Strategy 4: Alternative domain with GET
    {
      url: `https://digitaladdressgh.com/api/coordinates?lat=${lat}&long=${lon}`,
      extract: (data: any) =>
        data?.data?.address ||
        data?.address ||
        data?.Address ||
        '',
    },
  ];

  for (const ep of endpoints) {
    try {
      const fetchOpts: RequestInit = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'RevMgmtSys/1.0',
        },
        signal: AbortSignal.timeout(6000),
      };
      if (ep.method === 'POST' && ep.body) {
        fetchOpts.method = 'POST';
        fetchOpts.body = ep.body;
      }

      const res = await fetch(ep.url, fetchOpts);
      if (!res.ok) continue;

      const data = await res.json();
      const address = ep.extract(data);

      if (address && address.trim()) {
        return NextResponse.json({ address: address.trim(), source: 'ghanapostgps' });
      }
    } catch {
      // Try next endpoint
      continue;
    }
  }

  return NextResponse.json({ address: '', source: 'all-failed' });
}
