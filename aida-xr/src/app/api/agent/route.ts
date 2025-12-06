import { NextRequest, NextResponse } from 'next/server';
import { FREE_MUSIC_LIBRARY, getBestMatch } from '@/lib/freeMusic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyC_E1NN4CCxwpCVOY3HpcdFQUX3VKXMCpY";

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
11. AI_GUIDANCE: Provide visual guidance suggestions (arrows, ghost hands, countdowns).
    - parameters: {
        suggestions: [
          { id: string, type: "arrow"|"ghost_hand"|"countdown", target: string, action: string, beatsUntil: number, direction?: [number, number, number], position?: [number, number, number] }
        ],
        beatsUntilNextAction: number
      }
12. AUTO_MIX_SUGGESTIONS: Suggest track pairings and transition strategies.
    - parameters: {
        trackPairing: { trackA: string, trackB: string } | null,
        transitionType: "fade"|"cut"|"filter"|"eq" | null,
        idealTransitionPoint: number | null,
        recommendedBPMShift: number | null,
        frequencyCuts: { deck: "A"|"B", eq: {low?: number, mid?: number, high?: number} } | null
      }

TRACK LIBRARY:
${FREE_MUSIC_LIBRARY.map(t => `- "${t.id}": ${t.title} (${t.bpm} BPM, ${t.genre})`).join('\n')}

RULES:
- Output JSON ONLY. No markdown, no code blocks.
- "speech" should be a short, cool DJ announcement (e.g., "Dropping the bass!", "Fading into Deck B").
- If the user asks to "mix it" or "remix", use logical steps to transition.
`;

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

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
    console.log("🤖 Calling Gemini API...");
    const text = await callGemini(`${SYSTEM_PROMPT}\n${contextString}\nUser: "${message}"\nJSON:`);

    console.log("🤖 Gemini response:", text.slice(0, 200));
    
    // Clean up markdown if present
    let cleanText = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) cleanText = match[0];

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error:", cleanText);
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
    console.error("Agent Error:", e?.message, e?.stack);
    return NextResponse.json({ 
      action: "EXPLAIN", 
      speech: `Error: ${e?.message || 'Unknown error'}` 
    });
  }
}
