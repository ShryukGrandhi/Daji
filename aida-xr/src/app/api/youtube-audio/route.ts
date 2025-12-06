import { NextRequest, NextResponse } from 'next/server';

/**
 * YouTube Audio Extraction API
 * 
 * Note: Direct YouTube audio extraction requires server-side processing.
 * For production, consider using:
 * - yt-dlp (Python library)
 * - youtube-dl
 * - Or a service like yt-dlp-server
 * 
 * For now, this returns a proxy URL that can be used with CORS proxies
 * or direct audio streaming services.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const youtubeUrl = searchParams.get('url');
    
    if (!youtubeUrl) {
      return NextResponse.json({ error: 'YouTube URL required' }, { status: 400 });
    }

    // Extract video ID from YouTube URL
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoIdMatch) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoId = videoIdMatch[1];

    // Option 1: Use a CORS proxy service (for development)
    // Note: These services may have rate limits or require API keys
    const proxyUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Option 2: Return the video ID for client-side handling
    // The client can use libraries like youtube-dl-exec or similar
    
    // For now, return the video ID and let the client handle it
    // In production, you'd want to use yt-dlp server-side to extract audio
    return NextResponse.json({
      videoId,
      originalUrl: youtubeUrl,
      // Note: Direct audio URLs from YouTube are not publicly available
      // You'll need to use a service like yt-dlp-server or similar
      message: 'YouTube audio extraction requires server-side processing. Consider using yt-dlp or a similar service.'
    });

  } catch (error) {
    console.error('YouTube audio extraction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

