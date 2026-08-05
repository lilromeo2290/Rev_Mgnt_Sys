import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for what3words API.
 * Converts lat/long to a 3-word address (e.g. ///apple.tree.house).
 * Requires WHAT3WORDS_API_KEY environment variable on Vercel.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const apiKey = process.env.WHAT3WORDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      words: '',
      source: 'no-api-key',
      message: 'WHAT3WORDS_API_KEY not set in environment variables',
    });
  }

  try {
    const res = await fetch(
      `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat}%2C${lon}&key=${apiKey}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ words: '', source: 'what3words-error', status: res.status });
    }

    const data = await res.json();
    const words = data?.words || '';
    return NextResponse.json({ words, source: 'what3words' });
  } catch (err) {
    return NextResponse.json({
      words: '',
      source: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
