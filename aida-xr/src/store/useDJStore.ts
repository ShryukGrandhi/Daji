import { create } from 'zustand'
import { FREE_MUSIC_LIBRARY } from '@/lib/freeMusic'

export type DeckSourceType = 'local' | 'youtube' | 'stemDemo'
export type EmotionMode = 'neutral' | 'dreamy' | 'sad' | 'hype' | 'aggressive'
export type SpatialSourceType = 'deckA' | 'deckB' | 'stem:drums' | 'stem:bass' | 'stem:vocals'

interface HotCue {
  id: number // 1-8
  position: number // 0-1 (position in track)
  color: string
  label?: string
}

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
  loopIn: number | null // Loop start position (0-1)
  loopOut: number | null // Loop end position (0-1)
  loopLength: number | null // Auto-loop length in beats (1, 2, 4, 8, 16)
  startPosition: number // 0-1
  currentPosition: number // 0-1
  // Effects
  reverb: number // 0-1
  delay: number  // 0-1
  distortion: number // 0-1
  flanger: number // 0-1
  noise: number // 0-1
  gater: number // 0-1
  // Playback Rate (for track morphing)
  playbackRate: number // 0.5 - 2.0
  // Hot Cues
  hotCues: HotCue[]
  // Beat sync
  beatPhase: number // 0-1 (position in current beat)
  isSynced: boolean
  // Energy level (for AI)
  energyLevel: number // 0-1
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
  isInteracting: boolean // Disable camera when interacting with controls
  demoMode: boolean // Demo mode active - disables AI guidance arrows
  demoIntervalId: NodeJS.Timeout | null // To stop demo
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
  
  // AI Guidance State
  aiGuidance: {
    active: boolean
    suggestions: Array<{
      id: string
      type: 'arrow' | 'ghost_hand' | 'countdown'
      target: string // Control ID (e.g., "deckA-eq-high", "crossfader")
      action: string // What to do
      beatsUntil: number
      direction?: [number, number, number]
      position?: [number, number, number]
    }>
    currentBeat: number
    beatsUntilNextAction: number
  }
  
  // Auto-Mix Suggestions
  autoMixSuggestions: {
    trackPairing: { trackA: string, trackB: string } | null
    transitionType: 'fade' | 'cut' | 'filter' | 'eq' | null
    idealTransitionPoint: number | null // beats
    recommendedBPMShift: number | null
    frequencyCuts: { deck: 'A' | 'B', eq: { low?: number, mid?: number, high?: number } } | null
  }

  deckA: DeckState
  deckB: DeckState
  crossfader: number // 0 (A) to 1 (B)
  masterVolume: number // 0-1

  // Actions
  toggleCoachMode: () => void
  toggleStemMode: () => void
  setIsInteracting: (val: boolean) => void // New: Control camera
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
  
  // Hot Cue Actions
  setHotCue: (deck: 'A' | 'B', cueId: number, position: number) => void
  clearHotCue: (deck: 'A' | 'B', cueId: number) => void
  jumpToHotCue: (deck: 'A' | 'B', cueId: number) => void
  
  // Loop Actions
  setLoopIn: (deck: 'A' | 'B', position: number) => void
  setLoopOut: (deck: 'A' | 'B', position: number) => void
  setAutoLoop: (deck: 'A' | 'B', beats: number) => void
  clearLoop: (deck: 'A' | 'B') => void
  
  // AI Guidance Actions
  setAIGuidance: (guidance: DJState['aiGuidance']) => void
  setAutoMixSuggestions: (suggestions: DJState['autoMixSuggestions']) => void
  
  // Grading
  addScore: (points: number, reason: string) => void
  setChallenge: (challenge: string) => void
  startDemoMix: () => void
  stopDemoMix: () => void
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
  loopIn: null,
  loopOut: null,
  loopLength: null,
  startPosition: 0,
  currentPosition: 0,
  reverb: 0,
  delay: 0,
  distortion: 0,
  flanger: 0,
  noise: 0,
  gater: 0,
  playbackRate: 1.0,
  hotCues: [],
  beatPhase: 0,
  isSynced: false,
  energyLevel: 0.5
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
  isInteracting: false,
  demoMode: false,
  demoIntervalId: null,
  lastCommand: null,
  coachMessage: "Welcome to AIDA! Press DEMO MIX for a perfect transition.",
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
  
  // AI Guidance Initial State
  aiGuidance: {
    active: false,
    suggestions: [],
    currentBeat: 0,
    beatsUntilNextAction: 0
  },
  
  // Auto-Mix Suggestions Initial State
  autoMixSuggestions: {
    trackPairing: null,
    transitionType: null,
    idealTransitionPoint: null,
    recommendedBPMShift: null,
    frequencyCuts: null
  },

  deckA: initialDeckA,
  deckB: initialDeckB,
  crossfader: 0.5,
  masterVolume: 0.8,

  toggleCoachMode: () => set((s) => ({ coachMode: !s.coachMode })),
  toggleStemMode: () => set((s) => ({ 
    stemMode: !s.stemMode,
    coachMessage: !s.stemMode ? "STEM MODE: EQ knobs now control stems" : "EQ MODE: Standard High/Mid/Low"
  })),
  setIsInteracting: (val) => set({ isInteracting: val }),
  
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

  // Hot Cue Actions
  setHotCue: (deck, cueId, position) => set((s) => {
    const deckState = s[deck === 'A' ? 'deckA' : 'deckB']
    const hotCues = [...deckState.hotCues]
    const existingIndex = hotCues.findIndex(c => c.id === cueId)
    
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
    
    if (existingIndex >= 0) {
      hotCues[existingIndex] = { id: cueId, position, color: colors[cueId - 1] }
    } else {
      hotCues.push({ id: cueId, position, color: colors[cueId - 1] })
    }
    
    return {
      [deck === 'A' ? 'deckA' : 'deckB']: { ...deckState, hotCues }
    }
  }),
  
  clearHotCue: (deck, cueId) => set((s) => {
    const deckState = s[deck === 'A' ? 'deckA' : 'deckB']
    return {
      [deck === 'A' ? 'deckA' : 'deckB']: {
        ...deckState,
        hotCues: deckState.hotCues.filter(c => c.id !== cueId)
      }
    }
  }),
  
  jumpToHotCue: (deck, cueId) => set((s) => {
    const deckState = s[deck === 'A' ? 'deckA' : 'deckB']
    const cue = deckState.hotCues.find(c => c.id === cueId)
    if (cue) {
      return {
        [deck === 'A' ? 'deckA' : 'deckB']: {
          ...deckState,
          currentPosition: cue.position,
          startPosition: cue.position
        }
      }
    }
    return s
  }),
  
  // Loop Actions
  setLoopIn: (deck, position) => set((s) => ({
    [deck === 'A' ? 'deckA' : 'deckB']: {
      ...s[deck === 'A' ? 'deckA' : 'deckB'],
      loopIn: position,
      loop: true
    }
  })),
  
  setLoopOut: (deck, position) => set((s) => ({
    [deck === 'A' ? 'deckA' : 'deckB']: {
      ...s[deck === 'A' ? 'deckA' : 'deckB'],
      loopOut: position,
      loop: true
    }
  })),
  
  setAutoLoop: (deck, beats) => set((s) => ({
    [deck === 'A' ? 'deckA' : 'deckB']: {
      ...s[deck === 'A' ? 'deckA' : 'deckB'],
      loopLength: beats,
      loop: true
    }
  })),
  
  clearLoop: (deck) => set((s) => ({
    [deck === 'A' ? 'deckA' : 'deckB']: {
      ...s[deck === 'A' ? 'deckA' : 'deckB'],
      loopIn: null,
      loopOut: null,
      loopLength: null,
      loop: false
    }
  })),
  
  // AI Guidance Actions
  setAIGuidance: (guidance) => set({ aiGuidance: guidance }),
  setAutoMixSuggestions: (suggestions) => set({ autoMixSuggestions: suggestions }),

  // Demo Mode - Professional DJ transition
  startDemoMix: () => {
    const state = get()
    if (state.demoMode) return // Already running
    
    const { updateDeck, setCrossfader, setCoachMessage, addScore } = get()
    
    // Clear any existing interval
    if (state.demoIntervalId) {
      clearInterval(state.demoIntervalId)
    }
    
    set({ demoMode: true, aiGuidance: { ...state.aiGuidance, active: false } })
    
    // 1. Setup tracks - Start with Deck A
    updateDeck('A', { 
      track: "Stayin' Alive", 
      url: '/BeeGees.mp4', 
      bpm: 104, 
      playing: true, 
      volume: 1,
      sourceType: 'local', // Important for audio engine!
      eq: { low: 0.8, mid: 0.7, high: 0.7 },
      filter: 1,
      reverb: 0,
      delay: 0
    })
    updateDeck('B', { 
      track: "Another One Bites the Dust", 
      url: '/Queen.mp4', 
      bpm: 110, 
      playing: false, 
      volume: 0, 
      sourceType: 'local', // Important for audio engine!
      eq: { low: 0, mid: 0.5, high: 0.6 }, // Start filtered
      filter: 0.3, // Low pass to start
      reverb: 0,
      delay: 0
    })
    setCrossfader(0)
    setCoachMessage("🎧 DEMO: Stayin' Alive - Building energy...")

    // Timeline:
    // 0-5s: Deck A plays, build anticipation
    // 5s: Cue Deck B with bass cut
    // 5-10s: Gradual filter open on B
    // 10-18s: Smooth crossfade with bass swap
    // 18s+: Full transition to B
    
    const timeouts: NodeJS.Timeout[] = []

    // 5s - Cue Deck B
    timeouts.push(setTimeout(() => {
      if (!get().demoMode) return
      updateDeck('B', { playing: true, volume: 0.3 })
      setCoachMessage("🎚️ Bringing in Queen - filtered...")
    }, 5000))

    // 6-10s - Open filter gradually
    for (let i = 0; i < 20; i++) {
      timeouts.push(setTimeout(() => {
        if (!get().demoMode) return
        const filterVal = 0.3 + (i / 20) * 0.7 // 0.3 -> 1.0
        updateDeck('B', { filter: filterVal })
      }, 6000 + i * 200))
    }

    timeouts.push(setTimeout(() => {
      if (!get().demoMode) return
      setCoachMessage("🔊 Opening filter on Deck B...")
    }, 7000))

    // 10s - Start the crossfade transition
    timeouts.push(setTimeout(() => {
      if (!get().demoMode) return
      setCoachMessage("⏱️ Starting the transition - watch the bass swap!")
      
      // Store interval ID for cleanup
      let step = 0
      const totalSteps = 80 // 8 seconds at 100ms intervals
      
      const transitionInterval = setInterval(() => {
        if (!get().demoMode) {
          clearInterval(transitionInterval)
          return
        }
        
        step++
        const progress = step / totalSteps // 0 -> 1

        // Crossfader: smooth S-curve
        const crossfadeVal = Math.pow(progress, 0.8) // Slightly faster start
        setCrossfader(crossfadeVal)
        
        // Volume swap (smooth)
        updateDeck('A', { volume: Math.max(0, 1 - progress * 1.2) })
        updateDeck('B', { volume: Math.min(1, 0.3 + progress * 0.7) })
        
        // THE BASS SWAP - This is the key to a clean mix!
        // Gradually cut bass on A and bring it in on B
        const bassA = Math.max(0, 0.8 - progress * 1.2) // 0.8 -> 0
        const bassB = Math.min(0.9, progress * 0.9)     // 0 -> 0.9
        
        updateDeck('A', { eq: { low: bassA, mid: 0.7 - progress * 0.2, high: 0.7 - progress * 0.3 } })
        updateDeck('B', { eq: { low: bassB, mid: 0.5 + progress * 0.3, high: 0.6 + progress * 0.3 } })
        
        // Coaching messages at key points
        if (step === 20) setCoachMessage("🎛️ Swapping bass frequencies...")
        if (step === 40) setCoachMessage("📈 Halfway through - smooth!")
        if (step === 60) setCoachMessage("🎵 Almost there...")
        
        if (step >= totalSteps) {
          clearInterval(transitionInterval)
          set({ demoIntervalId: null })
          
          // Final state
          setCrossfader(1)
          updateDeck('A', { playing: false, volume: 0 })
          updateDeck('B', { 
            volume: 1, 
            eq: { low: 0.8, mid: 0.75, high: 0.75 },
            filter: 1
          })
          setCoachMessage("✨ PERFECT TRANSITION! Another One Bites the Dust!")
          addScore(100, "Demo Mix Complete!")
          
          // Let it play for a bit then reset demo mode
          setTimeout(() => {
            if (get().demoMode) {
              set({ demoMode: false })
            }
          }, 5000)
        }
      }, 100)
      
      set({ demoIntervalId: transitionInterval })
    }, 10000))
    
    // Store timeouts for potential cleanup
    // @ts-ignore - storing for cleanup
    set({ _demoTimeouts: timeouts })
  },

  stopDemoMix: () => {
    const state = get()
    
    // Clear interval
    if (state.demoIntervalId) {
      clearInterval(state.demoIntervalId)
    }
    
    // Clear timeouts
    // @ts-ignore
    if (state._demoTimeouts) {
      // @ts-ignore
      state._demoTimeouts.forEach((t: NodeJS.Timeout) => clearTimeout(t))
    }
    
    // Stop playback
    get().updateDeck('A', { playing: false })
    get().updateDeck('B', { playing: false })
    
    set({ 
      demoMode: false, 
      demoIntervalId: null,
      coachMessage: "Demo stopped. Ready to mix!"
    })
  },

  resetControls: () => set({
    deckA: { ...initialDeckA, playing: false },
    deckB: { ...initialDeckB, playing: false },
    crossfader: 0.5,
    masterVolume: 0.8,
    djScore: 0,
    djLevel: "Novice",
    emotionMode: 'neutral',
    remixMode: false,
    aiGuidance: {
      active: false,
      suggestions: [],
      currentBeat: 0,
      beatsUntilNextAction: 0
    },
    autoMixSuggestions: {
      trackPairing: null,
      transitionType: null,
      idealTransitionPoint: null,
      recommendedBPMShift: null,
      frequencyCuts: null
    }
  })
}))
