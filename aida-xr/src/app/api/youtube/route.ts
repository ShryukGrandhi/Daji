import { NextRequest, NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

// Extract audio URL from YouTube
export async function GET(req: NextRequest) {
  const videoUrl = req.nextUrl.searchParams.get('url');
  
  if (!videoUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    console.log('[YouTube] Extracting audio from:', videoUrl);
    
    // Get audio URL using yt-dlp
    const result = await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      extractAudio: false, // We want the audio stream URL, not download
      format: 'bestaudio[ext=m4a]/bestaudio/best', // Best audio quality
    }) as any;

    // Find the best audio format
    const audioFormats = result.formats?.filter((f: any) => 
      f.acodec !== 'none' && (f.vcodec === 'none' || !f.vcodec)
    ) || [];
    
    // Get the best audio URL
    let audioUrl = audioFormats[audioFormats.length - 1]?.url || result.url;
    
    // If no audio-only format, get any format with audio
    if (!audioUrl) {
      const anyAudio = result.formats?.find((f: any) => f.acodec !== 'none');
      audioUrl = anyAudio?.url;
    }

    if (!audioUrl) {
      return NextResponse.json({ error: 'No audio stream found' }, { status: 404 });
    }

    console.log('[YouTube] Got audio URL for:', result.title);

    return NextResponse.json({
      title: result.title,
      duration: result.duration,
      audioUrl: audioUrl,
      thumbnail: result.thumbnail,
    });

  } catch (error: any) {
    console.error('[YouTube] Error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to extract audio',
      details: error.message 
    }, { status: 500 });
  }
}


