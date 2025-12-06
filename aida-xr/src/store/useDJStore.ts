import { create } from 'zustand'
import { FREE_MUSIC_LIBRARY } from '@/lib/freeMusic'

export type DeckSourceType = 'local' | 'youtube' | 'stemDemo'
export type EmotionMode = 'neutral' | 'dreamy' | 'sad' | 'hype' | 'aggressive'
export type SpatialSourceType = 'deckA' | 'deckB' | 'stem:drums' | 'stem:bass' | 'stem:vocals'

interface DeckState {
  sourceType: DeckSourceType
  loading: boolean // New: Loading state
  playing: boolean
  track: string | null
  url: string | null
  videoId: string | null // For YouTube
  bpm: number
  volume: number
  eq: {
    low: number  // 0-1
    mid: number  // 0-1
    high: number // 0-1
  }
  filter: number // 0-1
  loop: boolean
  startPosition: number // 0-1
  currentPosition: number // 0-1
  // Effects
  reverb: number // 0-1
  delay: number  // 0-1
  distortion: number // 0-1
  // Playback Rate (for track morphing)
  playbackRate: number // 0.5 - 2.0
}

interface SpatialSource {
  id: string
  type: SpatialSourceType
  position: [number, number, number]
  gain: number
}

interface TrackSection {
  id: string
  label: string
  orderIndex: number
  color: string
  startTime?: number // theoretical start time
  duration?: number
}

interface DJState {
  coachMode: boolean
  stemMode: boolean
  lastCommand: string | null
  coachMessage: string | null
  activeHighlighter: string | null
  agentThought: string | null
  trackHistory: Array<{ title: string, url: string, timestamp: number }>
  suggestedTracks: Array<{id: string, title: string, bpm: number, mood?: string, url?: string}>

  // Grading / Gamification
  djScore: number
  djLevel: string
  currentChallenge: string | null
  challengeProgress: number // 0-1
  sessionStats: { transitions: 0, perfectDrops: 0, clashes: 0 }

  // New Novel Features State
  emotionMode: EmotionMode
  spatialSources: SpatialSource[]
  trackSections: { A: TrackSection[], B: TrackSection[] }
  remixMode: boolean

  deckA: DeckState
  deckB: DeckState
  crossfader: number // 0 (A) to 1 (B)
  masterVolume: number // 0-1

  // Actions
  toggleCoachMode: () => void
  toggleStemMode: () => void
  setCoachMessage: (msg: string) => void
  setAgentThought: (thought: string) => void
  addToHistory: (track: { title: string, url: string }) => void
  setSuggestedTracks: (tracks: Array<{id: string, title: string, bpm: number, mood?: string, url?: string}>) => void
  setCrossfader: (val: number) => void
  setMasterVolume: (val: number) => void
  updateDeck: (deck: 'A' | 'B', updates: Partial<DeckState>) => void
  resetControls: () => void
  
  // Novel Feature Actions
  setEmotionMode: (mode: EmotionMode) => void
  updateSpatialSource: (id: string, position: [number, number, number]) => void
  setTrackSections: (deck: 'A' | 'B', sections: TrackSection[]) => void
  toggleRemixMode: () => void
  
  // Grading
  addScore: (points: number, reason: string) => void
  setChallenge: (challenge: string) => void
}

const defaultDeck: DeckState = {
  sourceType: 'local',
  loading: false,
  playing: false,
  track: null,
  url: null,
  videoId: null,
  bpm: 128,
  volume: 1,
  eq: { low: 0.5, mid: 0.5, high: 0.5 },
  filter: 1,
  loop: true,
  startPosition: 0,
  currentPosition: 0,
  reverb: 0,
  delay: 0,
  distortion: 0,
  playbackRate: 1.0
}

// Initialize with sample tracks
const trackA = FREE_MUSIC_LIBRARY[0]
const trackB = FREE_MUSIC_LIBRARY[1]

const initialDeckA: DeckState = {
  ...defaultDeck,
  track: trackA?.title || 'Track A',
  url: trackA?.url || null,
  bpm: trackA?.bpm || 120
}

const initialDeckB: DeckState = {
  ...defaultDeck,
  track: trackB?.title || 'Track B',
  url: trackB?.url || null,
  bpm: trackB?.bpm || 120
}

const defaultSections: TrackSection[] = [
    { id: 'intro', label: 'Intro', orderIndex: 0, color: '#3b82f6', duration: 30 },
    { id: 'verse', label: 'Verse', orderIndex: 1, color: '#10b981', duration: 30 },
    { id: 'build', label: 'Build', orderIndex: 2, color: '#f59e0b', duration: 15 },
    { id: 'drop', label: 'Drop', orderIndex: 3, color: '#ef4444', duration: 30 },
]

export const useDJStore = create<DJState>((set, get) => ({
  coachMode: true,
  stemMode: false,
  lastCommand: null,
  coachMessage: "Welcome to AIDA! Try the Vibe Orb or Sculpt the Waveforms.",
  activeHighlighter: null,
  agentThought: null,
  trackHistory: [],
  suggestedTracks: FREE_MUSIC_LIBRARY.map(t => ({
    id: t.id,
    title: t.title,
    bpm: t.bpm,
    mood: t.genre,
    url: t.url
  })),

  djScore: 0,
  djLevel: "Novice",
  currentChallenge: "Perform a smooth transition (slow crossfade)",
  challengeProgress: 0,
  sessionStats: { transitions: 0, perfectDrops: 0, clashes: 0 },

  // Novel Features Initial State
  emotionMode: 'neutral',
  spatialSources: [
    { id: 'deckA', type: 'deckA', position: [-1, 1, -2], gain: 1 },
    { id: 'deckB', type: 'deckB', position: [1, 1, -2], gain: 1 }
  ],
  trackSections: {
    A: [...defaultSections],
    B: [...defaultSections]
  },
  remixMode: false,

  deckA: initialDeckA,
  deckB: initialDeckB,
  crossfader: 0.5,
  masterVolume: 0.8,

  toggleCoachMode: () => set((s) => ({ coachMode: !s.coachMode })),
  toggleStemMode: () => set((s) => ({ 
    stemMode: !s.stemMode,
    coachMessage: !s.stemMode ? "STEM MODE: EQ knobs now control stems" : "EQ MODE: Standard High/Mid/Low"
  })),
  
  setCoachMessage: (msg) => set({ coachMessage: msg }),
  setAgentThought: (thought) => set({ agentThought: thought }),
  
  addToHistory: (track) => set((s) => ({
    trackHistory: [{ ...track, timestamp: Date.now() }, ...s.trackHistory].slice(0, 10)
  })),
  
  setSuggestedTracks: (tracks) => set({ suggestedTracks: tracks }),
  
  setCrossfader: (val) => {
    const prev = get().crossfader
    const newVal = Math.max(0, Math.min(1, val))
    
    // Challenge Logic
    if (get().currentChallenge?.includes("smooth transition")) {
        const speed = Math.abs(newVal - prev)
        if (speed < 0.05 && speed > 0.001) {
            const progress = Math.min(1, (get().challengeProgress || 0) + 0.05)
            set({ challengeProgress: progress })
            if (progress >= 1) {
                get().addScore(50, "Challenge Complete: Smooth Transition!")
                set({ currentChallenge: null, challengeProgress: 0 })
            }
        }
    }
    set({ crossfader: newVal })
  },
  
  setMasterVolume: (val) => set({ masterVolume: Math.max(0, Math.min(1, val)) }),
  
  updateDeck: (deck, updates) =>
    set((s) => ({
      [deck === 'A' ? 'deckA' : 'deckB']: {
        ...s[deck === 'A' ? 'deckA' : 'deckB'],
        ...updates,
      },
    })),

  // Novel Feature Actions Implementation
  setEmotionMode: (mode) => {
      set({ emotionMode: mode })
      
      // Apply presets based on emotion
      const presets = {
          neutral: { filter: 1, reverb: 0, distortion: 0, delay: 0 },
          dreamy: { filter: 0.6, reverb: 0.6, distortion: 0, delay: 0.4 },
          sad: { filter: 0.4, reverb: 0.3, distortion: 0, delay: 0 },
          hype: { filter: 1, reverb: 0.1, distortion: 0.1, delay: 0.2 },
          aggressive: { filter: 1, reverb: 0, distortion: 0.4, delay: 0 }
      }
      
      const p = presets[mode]
      // Apply to both decks for now (global vibe)
      const updateDeckState = (deck: DeckState) => ({
          ...deck,
          filter: p.filter,
          reverb: p.reverb,
          distortion: p.distortion,
          delay: p.delay
      })
      
      set(s => ({
          deckA: updateDeckState(s.deckA),
          deckB: updateDeckState(s.deckB),
          coachMessage: `Vibe changed to ${mode.toUpperCase()}`
      }))
  },

  updateSpatialSource: (id, position) => set((s) => ({
      spatialSources: s.spatialSources.map(src => 
          src.id === id ? { ...src, position } : src
      )
  })),

  setTrackSections: (deck, sections) => set((s) => ({
      trackSections: {
          ...s.trackSections,
          [deck]: sections
      },
      coachMessage: `Track structure updated on Deck ${deck}`
  })),

  toggleRemixMode: () => set((s) => {
      const newMode = !s.remixMode
      return {
          remixMode: newMode,
          coachMessage: newMode ? "AI REMIX MODE: ACTIVE" : "AI Remix Mode: OFF"
      }
  }),

  addScore: (points, reason) => set((s) => {
    const newScore = s.djScore + points
    let newLevel = s.djLevel
    if (newScore > 100) newLevel = "Rookie"
    if (newScore > 500) newLevel = "Pro"
    if (newScore > 1000) newLevel = "Legend"
    
    return { 
      djScore: newScore, 
      djLevel: newLevel,
      coachMessage: `+${points} PTS: ${reason}` 
    }
  }),
  
  setChallenge: (challenge) => set({ currentChallenge: challenge, challengeProgress: 0 }),

  resetControls: () => set({
    deckA: { ...initialDeckA, playing: false },
    deckB: { ...initialDeckB, playing: false },
    crossfader: 0.5,
    masterVolume: 0.8,
    djScore: 0,
    djLevel: "Novice",
    emotionMode: 'neutral',
    remixMode: false
  })
}))
