import { create } from 'zustand'

interface DeckState {
  playing: boolean
  track: string | null
  bpm: number
  eq: {
    low: number // 0-1 (0.5 center)
    high: number // 0-1 (0.5 center)
  }
  filter: number // 0-1 (0.5 center)
  loop: number | null
}

interface DJState {
  coachMode: boolean
  lastCommand: string | null
  coachMessage: string | null
  activeHighlighter: string | null // ID of the control being explained
  suggestedTracks: Array<{id: string, title: string, bpm: number, mood: string}>

  deckA: DeckState
  deckB: DeckState
  crossfader: number // 0 (Left) to 1 (Right)

  // Actions
  toggleCoachMode: () => void
  setCoachMessage: (msg: string) => void
  setSuggestedTracks: (tracks: Array<{id: string, title: string, bpm: number, mood: string}>) => void
  setCrossfader: (val: number) => void
  updateDeck: (deck: 'A' | 'B', updates: Partial<DeckState>) => void
  resetControls: () => void
}

export const useDJStore = create<DJState>((set) => ({
  coachMode: false,
  lastCommand: null,
  coachMessage: "Welcome to AIDA. Say 'Help' to start.",
  activeHighlighter: null,
  suggestedTracks: [],

  deckA: {
    playing: false,
    track: 'Summer Vibes',
    bpm: 120,
    eq: { low: 0.5, high: 0.5 },
    filter: 0.5,
    loop: null,
  },
  deckB: {
    playing: false,
    track: 'Night Drive',
    bpm: 122,
    eq: { low: 0.5, high: 0.5 },
    filter: 0.5,
    loop: null,
  },
  crossfader: 0.5,

  toggleCoachMode: () => set((state) => ({ coachMode: !state.coachMode })),
  
  setCoachMessage: (msg) => set({ coachMessage: msg }),

  setSuggestedTracks: (tracks) => set({ suggestedTracks: tracks }),
  
  setCrossfader: (val) => set({ crossfader: Math.max(0, Math.min(1, val)) }),
  
  updateDeck: (deck, updates) =>
    set((state) => ({
      [deck === 'A' ? 'deckA' : 'deckB']: {
        ...state[deck === 'A' ? 'deckA' : 'deckB'],
        ...updates,
      },
    })),

  resetControls: () => set({
      deckA: { playing: false, track: 'Summer Vibes', bpm: 120, eq: { low: 0.5, high: 0.5 }, filter: 0.5, loop: null },
      deckB: { playing: false, track: 'Night Drive', bpm: 122, eq: { low: 0.5, high: 0.5 }, filter: 0.5, loop: null },
      crossfader: 0.5
  })
}))

