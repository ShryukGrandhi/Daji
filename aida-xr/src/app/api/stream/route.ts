import { NextRequest, NextResponse } from 'next/server';

// Simple Stream Proxy
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing URL', { status: 400 });

  try {
    // Fetch the stream from the external URL (Google/YouTube CDN)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Range': req.headers.get('range') || 'bytes=0-',
      },
    });

    if (!response.ok && response.status !== 206) {
      console.error(`[Proxy] Upstream error: ${response.status}`);
      return new NextResponse('Upstream Error', { status: 502 });
    }

    // Forward important headers
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'audio/mp4');
    headers.set('Access-Control-Allow-Origin', '*'); // Critical for client-side playback
    headers.set('Accept-Ranges', 'bytes');
    
    if (response.headers.get('Content-Length')) {
      headers.set('Content-Length', response.headers.get('Content-Length')!);
    }
    if (response.headers.get('Content-Range')) {
      headers.set('Content-Range', response.headers.get('Content-Range')!);
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });

  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
