import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for Ghana Post GPS lookup.
 * Avoids browser CORS issues by calling the Ghana Post GPS API server-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  try {
    // Try the Ghana Post GPS API server-side (no CORS on server)
    const res = await fetch(
      `https://ghanapostgps.com/api/coordinates?lat=${lat}&long=${lon}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RevMgmtSys/1.0',
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ address: '', source: 'ghanapostgps', status: res.status });
    }

    const data = await res.json();
    // Try multiple possible response shapes
    const address =
      data?.data?.address ||
      data?.address ||
      data?.Address ||
      data?.data?.Address ||
      '';

    if (address) {
      return NextResponse.json({ address, source: 'ghanapostgps' });
    }

    return NextResponse.json({ address: '', source: 'ghanapostgps-empty' });
  } catch (err) {
    // Ghana Post GPS API failed — return empty so client can show helpful message
    return NextResponse.json({
      address: '',
      source: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
