import { NextRequest, NextResponse } from 'next/server';

// DigitalOcean Agent - Music Mastermind
const DO_AGENT_KEY = process.env.DO_AGENT_KEY || "z5L4McrWAZHx21yFJBBcpln_4BGpWPZD";
const DO_AGENT_ENDPOINT = "https://cluster-api.do-ai.run/v1/chat/completions";

interface MastermindResponse {
  strategy: string;
  phase: 'intro' | 'buildup' | 'peak' | 'transition' | 'breakdown' | 'outro';
  energyTarget: number; // 0-1
  recommendations: {
    eqStrategy: string;
    filterStrategy: string;
    transitionStyle: string;
    timing: string;
  };
  djTip: string;
}

const MASTERMIND_SYSTEM_PROMPT = `You are the DJ MASTERMIND - a legendary music producer and DJ coach with decades of experience mixing disco, funk, rock, and electronic music.

Your job is to analyze the current DJ state and provide HIGH-LEVEL MUSICAL STRATEGY that will be fed to an AI mixer.

You understand:
- Song structure (intro, verse, chorus, bridge, breakdown, drop, outro)
- Energy flow and how to build/release tension
- Bass swap techniques for clean transitions
- Filter sweeps and EQ for smooth blends
- Beat matching and phrase matching
- Key compatibility between tracks
- When to cut vs fade vs filter transition

RESPOND WITH JSON ONLY:
{
  "strategy": "Brief description of what should happen next musically",
  "phase": "intro|buildup|peak|transition|breakdown|outro",
  "energyTarget": 0.0-1.0,
  "recommendations": {
    "eqStrategy": "What to do with EQ (e.g., 'cut bass on outgoing, boost highs on incoming')",
    "filterStrategy": "Filter movements (e.g., 'slow high-pass sweep on deck A')",
    "transitionStyle": "fade|cut|filter_sweep|bass_swap|echo_out",
    "timing": "How many beats/bars until next action"
  },
  "djTip": "A pro tip for this moment"
}`;

async function callDigitalOceanAgent(state: any): Promise<MastermindResponse | null> {
  try {
    const stateDescription = `
CURRENT MIX STATE:
- Deck A: ${state.deckA?.track || 'Unknown'} @ ${state.deckA?.bpm || 120} BPM
  Playing: ${state.deckA?.playing ? 'YES' : 'NO'}
  Volume: ${((state.deckA?.volume || 0) * 100).toFixed(0)}%
  Filter: ${((state.deckA?.filter || 1) * 100).toFixed(0)}%
  EQ: Low ${((state.deckA?.eq?.low || 0.5) * 100).toFixed(0)}%, Mid ${((state.deckA?.eq?.mid || 0.5) * 100).toFixed(0)}%, High ${((state.deckA?.eq?.high || 0.5) * 100).toFixed(0)}%
  Energy: ${((state.deckA?.energyLevel || 0.5) * 100).toFixed(0)}%

- Deck B: ${state.deckB?.track || 'Unknown'} @ ${state.deckB?.bpm || 120} BPM
  Playing: ${state.deckB?.playing ? 'YES' : 'NO'}
  Volume: ${((state.deckB?.volume || 0) * 100).toFixed(0)}%
  Filter: ${((state.deckB?.filter || 1) * 100).toFixed(0)}%
  EQ: Low ${((state.deckB?.eq?.low || 0.5) * 100).toFixed(0)}%, Mid ${((state.deckB?.eq?.mid || 0.5) * 100).toFixed(0)}%, High ${((state.deckB?.eq?.high || 0.5) * 100).toFixed(0)}%
  Energy: ${((state.deckB?.energyLevel || 0.5) * 100).toFixed(0)}%

- Crossfader: ${((state.crossfader || 0.5) * 100).toFixed(0)}% (0=A, 100=B)
- Current Phase: ${state.currentPhase || 'unknown'}
- Emotion Mode: ${state.emotionMode || 'neutral'}
- Mix Duration: ${state.mixDuration || 0} seconds

What should happen next to create the best possible mix?`;

    const response = await fetch(DO_AGENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DO_AGENT_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // DigitalOcean's hosted model
        messages: [
          { role: "system", content: MASTERMIND_SYSTEM_PROMPT },
          { role: "user", content: stateDescription }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DO Agent Error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let cleanContent = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const match = cleanContent.match(/\{[\s\S]*\}/);
    if (match) cleanContent = match[0];
    
    return JSON.parse(cleanContent) as MastermindResponse;
    
  } catch (error) {
    console.error("Mastermind Error:", error);
    return null;
  }
}

// Fallback strategy when DO agent is unavailable
function getFallbackStrategy(state: any): MastermindResponse {
  const crossfader = state.crossfader || 0.5;
  const bothPlaying = state.deckA?.playing && state.deckB?.playing;
  
  if (!bothPlaying) {
    return {
      strategy: "Start with deck A, build energy before bringing in deck B",
      phase: "intro",
      energyTarget: 0.5,
      recommendations: {
        eqStrategy: "Keep EQ flat on main deck, prepare incoming with bass cut",
        filterStrategy: "Full open on main deck",
        transitionStyle: "fade",
        timing: "8 bars"
      },
      djTip: "Let the track breathe before adding elements"
    };
  }
  
  if (crossfader < 0.3) {
    return {
      strategy: "Building energy - gradually introduce deck B elements",
      phase: "buildup",
      energyTarget: 0.7,
      recommendations: {
        eqStrategy: "Start cutting A's bass slightly, B's bass still cut",
        filterStrategy: "Open B's filter slowly",
        transitionStyle: "filter_sweep",
        timing: "16 beats"
      },
      djTip: "Use the filter to build anticipation"
    };
  }
  
  if (crossfader >= 0.3 && crossfader < 0.7) {
    return {
      strategy: "Peak energy - both tracks balanced, bass swap in progress",
      phase: "peak",
      energyTarget: 0.9,
      recommendations: {
        eqStrategy: "BASS SWAP: Cut A bass, bring in B bass",
        filterStrategy: "Both filters open",
        transitionStyle: "bass_swap",
        timing: "4 beats"
      },
      djTip: "The bass swap is the key to a clean mix!"
    };
  }
  
  return {
    strategy: "Completing transition - fade out deck A",
    phase: "transition",
    energyTarget: 0.8,
    recommendations: {
      eqStrategy: "A bass fully cut, B bass full",
      filterStrategy: "Close A's filter, B fully open",
      transitionStyle: "fade",
      timing: "8 beats"
    },
    djTip: "Smooth exit - let the new track take over completely"
  };
}

export async function POST(req: NextRequest) {
  try {
    const { state } = await req.json();
    console.log("🧠 Mastermind Request - analyzing mix state...");

    // Try DigitalOcean Agent first
    let strategy = await callDigitalOceanAgent(state);
    
    // Fall back to local strategy if DO agent fails
    if (!strategy) {
      console.log("🧠 Using fallback strategy");
      strategy = getFallbackStrategy(state);
    } else {
      console.log("🧠 DO Agent strategy:", strategy.strategy);
    }

    return NextResponse.json({
      success: true,
      mastermind: strategy
    });

  } catch (error: any) {
    console.error("Mastermind Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      mastermind: getFallbackStrategy({})
    });
  }
}

