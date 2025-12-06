import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { FREE_MUSIC_LIBRARY, getBestMatch } from '@/lib/freeMusic';

const SYSTEM_PROMPT = `You are AIDA, an AI DJ. Parse commands and respond with JSON only.

TRACKS:
- "stayin-alive" = "Stayin' Alive" (Bee Gees)
- "another-one-bites-the-dust" = "Another One Bites the Dust" (Queen)
- "world-burn" = "I'd Let The World Burn" (David Kushner)
- "hoodtrap" = "Hoodtrap / Mylancore Remix"
- "house" = "House Groove"
- "techno" = "Techno Drive"

ACTIONS:
- LOAD_TRACK: {deck:"A"|"B", trackId:string}
- PLAY: {deck:"A"|"B"}
- STOP: {deck:"A"|"B"}
- CROSSFADE: {value:0-1}
- BEAT_DROP: {}
- EXPLAIN: {}

Examples:
"play stayin alive" → {"action":"LOAD_TRACK","parameters":{"deck":"A","trackId":"stayin-alive"},"speech":"Playing Stayin' Alive"}
"another one bites the dust on B" → {"action":"LOAD_TRACK","parameters":{"deck":"B","trackId":"another-one-bites-the-dust"},"speech":"Playing Another One Bites the Dust"}

JSON only.`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    console.log("🎧 Agent:", message);

    // Pre-processing for instant local matches (faster than LLM)
    const lowerMsg = message.toLowerCase();
    let quickMatchId = null;
    
    if (lowerMsg.includes("stayin alive")) quickMatchId = "stayin-alive";
    else if (lowerMsg.includes("another one")) quickMatchId = "another-one-bites-the-dust";
    else if (lowerMsg.includes("world burn")) quickMatchId = "world-burn";

    if (quickMatchId) {
       const track = FREE_MUSIC_LIBRARY.find(t => t.id === quickMatchId);
       if (track) {
         return NextResponse.json({
            action: "LOAD_TRACK",
            parameters: {
              deck: "A", // Default to A if not specified (LLM handles deck parsing better, but this is fast path)
              trackId: track.id,
              title: track.title,
              url: track.url,
              bpm: track.bpm,
            },
            speech: `🎵 Playing "${track.title}"`
         });
       }
    }

    // LLM Path
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${SYSTEM_PROMPT}\n\nUser: "${message}"\nJSON:`,
    });

    let text = response.text || "";
    text = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ action: "EXPLAIN", speech: "I didn't catch that song name." });
    }

    // Handle LOAD_TRACK
    if (parsed.action === "LOAD_TRACK" && parsed.parameters?.trackId) {
      // Try exact ID match first
      let track = FREE_MUSIC_LIBRARY.find(t => t.id === parsed.parameters.trackId);
      
      // Fallback to search
      if (!track) {
        track = getBestMatch(parsed.parameters.trackId);
      }
      
      if (track) {
        return NextResponse.json({
          action: "LOAD_TRACK",
          parameters: {
            deck: parsed.parameters.deck || "A",
            trackId: track.id,
            title: track.title,
            url: track.url,
            bpm: track.bpm,
          },
          speech: `🎵 Playing "${track.title}" on Deck ${parsed.parameters.deck || "A"}`
        });
      }
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("Error:", e?.message);
    return NextResponse.json({ action: "EXPLAIN", speech: "Error processing command" });
  }
}
