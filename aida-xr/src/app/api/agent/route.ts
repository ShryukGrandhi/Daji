import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { FREE_MUSIC_LIBRARY, getBestMatch } from '@/lib/freeMusic';

// Define valid JSON actions in the prompt
const SYSTEM_PROMPT = `You are AIDA, an advanced AI DJ Assistant. Your goal is to help the user mix music professionally or take control when requested.

You receive the current state of the DJ console (decks, crossfader, BPM, etc.) and a User Request.
You must respond with a STRICT JSON object containing an "action", "parameters", and "speech".

AVAILABLE ACTIONS:
1. LOAD_TRACK: Load a song onto a deck.
   - parameters: { deck: "A"|"B", trackId: string }
2. PLAY: Start playback.
   - parameters: { deck: "A"|"B" }
3. STOP: Stop playback.
   - parameters: { deck: "A"|"B" }
4. SET_CROSSFADER: Move the crossfader.
   - parameters: { value: number (0.0 to 1.0) }
5. SET_EQ: Adjust EQ (Low/Mid/High).
   - parameters: { deck: "A"|"B", low?: number, mid?: number, high?: number } (0.0 to 1.0)
6. SET_FILTER: Adjust Filter.
   - parameters: { deck: "A"|"B", value: number } (0.0 to 1.0, 1.0 is open)
7. SET_EFFECT: Apply an effect (reverb, delay).
   - parameters: { deck: "A"|"B", effect: "reverb"|"delay", value: number } (0.0 to 1.0)
8. EMOTION_MODE: Change the vibe/lighting/presets.
   - parameters: { mode: "neutral"|"dreamy"|"sad"|"hype"|"aggressive" }
9. EXPLAIN: Just talk to the user.
   - parameters: {}
10. AI_REMIX_STEP: Perform the next logical mixing step based on the current state (for autonomous mixing).
    - parameters: { 
        updates: [
          { type: "deck", deck: "A"|"B", playing?: boolean, volume?: number, filter?: number, eq?: {low?: number, mid?: number, high?: number} },
          { type: "mixer", crossfader?: number, masterVolume?: number },
          { type: "emotion", mode?: string }
        ]
      }

TRACK LIBRARY:
${FREE_MUSIC_LIBRARY.map(t => `- "${t.id}": ${t.title} (${t.bpm} BPM, ${t.genre})`).join('\n')}

RULES:
- Output JSON ONLY. No markdown, no code blocks.
- "speech" should be a short, cool DJ announcement (e.g., "Dropping the bass!", "Fading into Deck B").
- If the user asks to "mix it" or "remix", use logical steps to transition.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, state } = await req.json();
    console.log("🎧 Agent Request:", message);

    // Quick Local Parsing for Track Loading (Faster than LLM)
    if (!state) { // Only do quick parse if not in complex remix loop
        const lowerMsg = message.toLowerCase();
        let quickMatchId = null;
        
        if (lowerMsg.includes("stayin alive")) quickMatchId = "stayin-alive";
        else if (lowerMsg.includes("another one")) quickMatchId = "another-one-bites-the-dust";
        else if (lowerMsg.includes("world burn")) quickMatchId = "world-burn";
        else if (lowerMsg.includes("hoodtrap")) quickMatchId = "hoodtrap";

        if (quickMatchId) {
            const track = FREE_MUSIC_LIBRARY.find(t => t.id === quickMatchId);
            if (track) {
                return NextResponse.json({
                    action: "LOAD_TRACK",
                    parameters: { deck: "A", trackId: track.id },
                    speech: `🎵 Loading "${track.title}"`
                });
            }
        }
    }

    // Context string construction
    let contextString = "";
    if (state) {
        contextString = `
CURRENT STATE:
Deck A: ${state.deckA.playing ? 'PLAYING' : 'STOPPED'}, Vol: ${state.deckA.volume.toFixed(2)}, Filter: ${state.deckA.filter.toFixed(2)}
Deck B: ${state.deckB.playing ? 'PLAYING' : 'STOPPED'}, Vol: ${state.deckB.volume.toFixed(2)}, Filter: ${state.deckB.filter.toFixed(2)}
Crossfader: ${state.crossfader.toFixed(2)}
Emotion: ${state.emotionMode}
`;
    }

    // Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${SYSTEM_PROMPT}\n${contextString}\nUser: "${message}"\nJSON:`,
    });

    let text = response.text || "";
    // Clean up markdown if present
    text = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error:", text);
      return NextResponse.json({ action: "EXPLAIN", speech: "I'm having trouble thinking right now." });
    }

    // Post-processing for LOAD_TRACK to ensure full track details
    if (parsed.action === "LOAD_TRACK" && parsed.parameters?.trackId) {
        let track = FREE_MUSIC_LIBRARY.find(t => t.id === parsed.parameters.trackId);
        if (!track) track = getBestMatch(parsed.parameters.trackId);
        
        if (track) {
            parsed.parameters.trackId = track.id;
            parsed.parameters.title = track.title;
            parsed.parameters.url = track.url;
            parsed.parameters.bpm = track.bpm;
        }
    }

    return NextResponse.json(parsed);

  } catch (e: any) {
    console.error("Agent Error:", e?.message);
    return NextResponse.json({ action: "EXPLAIN", speech: "System malfunction." });
  }
}
