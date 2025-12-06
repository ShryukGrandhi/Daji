import React, { useRef, useEffect } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import { useDJStore, EmotionMode } from '@/store/useDJStore'
import { useFrame } from '@react-three/fiber'

// Musical phases for the AI remix
type RemixPhase = 'intro' | 'building' | 'peak' | 'transition' | 'breakdown'

// Mastermind response type
interface MastermindStrategy {
  strategy: string
  phase: string
  energyTarget: number
  recommendations: {
    eqStrategy: string
    filterStrategy: string
    transitionStyle: string
    timing: string
  }
  djTip: string
}

// Smooth value interpolation
const lerp = (start: number, end: number, t: number) => start + (end - start) * t

export function RemixModeToggle() {
  const remixMode = useDJStore((state) => state.remixMode)
  const toggleRemixMode = useDJStore((state) => state.toggleRemixMode)
  const updateDeck = useDJStore((state) => state.updateDeck)
  const setEmotionMode = useDJStore((state) => state.setEmotionMode)
  const setCrossfader = useDJStore((state) => state.setCrossfader)
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)
  const addScore = useDJStore((state) => state.addScore)
  
  // Remix state tracking
  const timerRef = useRef(0)
  const phaseRef = useRef<RemixPhase>('intro')
  const phaseTimeRef = useRef(0) // Time in current phase
  const mastermindTimerRef = useRef(0) // Timer for mastermind calls
  const mastermindStrategyRef = useRef<MastermindStrategy | null>(null)
  const mixDurationRef = useRef(0) // Total mix duration
  
  const targetStateRef = useRef({
    crossfader: 0.5,
    deckA: { filter: 1, eqLow: 0.7, eqMid: 0.6, eqHigh: 0.6, volume: 1 },
    deckB: { filter: 1, eqLow: 0.7, eqMid: 0.6, eqHigh: 0.6, volume: 1 }
  })
  const currentValuesRef = useRef({
    crossfader: 0.5,
    deckA: { filter: 1, eqLow: 0.7, eqMid: 0.6, eqHigh: 0.6, volume: 1 },
    deckB: { filter: 1, eqLow: 0.7, eqMid: 0.6, eqHigh: 0.6, volume: 1 }
  })

  // Call the DigitalOcean Mastermind for high-level strategy
  const consultMastermind = async () => {
    const state = useDJStore.getState()
    try {
      const response = await fetch('/api/mastermind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: {
            deckA: {
              track: state.deckA.track,
              bpm: state.deckA.bpm,
              playing: state.deckA.playing,
              volume: state.deckA.volume,
              filter: state.deckA.filter,
              eq: state.deckA.eq,
              energyLevel: state.deckA.energyLevel
            },
            deckB: {
              track: state.deckB.track,
              bpm: state.deckB.bpm,
              playing: state.deckB.playing,
              volume: state.deckB.volume,
              filter: state.deckB.filter,
              eq: state.deckB.eq,
              energyLevel: state.deckB.energyLevel
            },
            crossfader: state.crossfader,
            currentPhase: phaseRef.current,
            emotionMode: state.emotionMode,
            mixDuration: mixDurationRef.current
          }
        })
      })
      
      const data = await response.json()
      if (data.success && data.mastermind) {
        mastermindStrategyRef.current = data.mastermind
        console.log("🧠 Mastermind Strategy:", data.mastermind.strategy)
        
        // Show DJ tip
        if (data.mastermind.djTip) {
          setCoachMessage(`🧠 ${data.mastermind.djTip}`)
        }
        
        // Map mastermind phase to our phase
        const phaseMap: Record<string, RemixPhase> = {
          'intro': 'intro',
          'buildup': 'building',
          'peak': 'peak',
          'transition': 'transition',
          'breakdown': 'breakdown',
          'outro': 'breakdown'
        }
        if (data.mastermind.phase && phaseMap[data.mastermind.phase]) {
          phaseRef.current = phaseMap[data.mastermind.phase]
        }
      }
    } catch (error) {
      console.error("Mastermind error:", error)
    }
  }

  // Calculate next musical phase based on current state
  const calculateNextPhase = (currentPhase: RemixPhase, phaseTime: number): RemixPhase => {
    const state = useDJStore.getState()
    const bothPlaying = state.deckA.playing && state.deckB.playing
    
    // Phase durations (in seconds)
    const phaseDurations = {
      intro: 8,
      building: 12,
      peak: 16,
      transition: 10,
      breakdown: 8
    }
    
    if (phaseTime > phaseDurations[currentPhase]) {
      // Move to next logical phase
      switch (currentPhase) {
        case 'intro': return 'building'
        case 'building': return 'peak'
        case 'peak': return bothPlaying ? 'transition' : 'breakdown'
        case 'transition': return 'peak'
        case 'breakdown': return 'building'
        default: return 'intro'
      }
    }
    return currentPhase
  }

  // Beat match deck B to deck A's tempo
  const applyBeatMatch = () => {
    const state = useDJStore.getState()
    if (state.deckA.bpm > 0 && state.deckB.bpm > 0) {
      // Match deck B to deck A's tempo
      const matchedRate = state.deckA.bpm / state.deckB.bpm
      // Only adjust if significant BPM difference
      if (Math.abs(matchedRate - 1) > 0.01) {
        updateDeck('B', { playbackRate: matchedRate })
      }
    }
  }

  // Set target values based on musical phase (enhanced by Mastermind)
  const setTargetsForPhase = (phase: RemixPhase, progress: number) => {
    const state = useDJStore.getState()
    const targets = targetStateRef.current
    const mm = mastermindStrategyRef.current // Mastermind strategy
    
    // Use mastermind's energy target if available
    const energyMod = mm?.energyTarget || 0.7
    
    // Show mastermind strategy in coach message if available
    const showStrategy = mm?.strategy ? `🧠 ${mm.strategy}` : null
    
    switch (phase) {
      case 'intro':
        // Start with one deck, clean sound
        setCoachMessage(showStrategy || "🎧 AI REMIX: Setting the vibe...")
        // Reset playback rates to natural
        updateDeck('A', { playbackRate: 1.0 })
        updateDeck('B', { playbackRate: 1.0 })
        targets.crossfader = 0.2
        targets.deckA = { filter: 1, eqLow: 0.7, eqMid: 0.6, eqHigh: 0.5, volume: 1 }
        targets.deckB = { filter: 0.3, eqLow: 0, eqMid: 0.3, eqHigh: 0.4, volume: 0.3 }
        break
        
      case 'building':
        // Beat match when bringing in deck B!
        if (progress < 0.1) {
          applyBeatMatch()
          setCoachMessage(showStrategy || "🔥 AI REMIX: Beat matching & building energy...")
        } else {
          setCoachMessage(showStrategy || "🔥 AI REMIX: Building energy...")
        }
        setEmotionMode('hype')
        
        // Adjust targets based on mastermind's energy recommendation
        const buildEnergy = energyMod
        targets.crossfader = lerp(0.2, 0.4, progress)
        targets.deckA = { 
          filter: 1, 
          eqLow: lerp(0.7, 0.5 * buildEnergy, progress), 
          eqMid: 0.7, 
          eqHigh: lerp(0.5, 0.7 * buildEnergy, progress), 
          volume: 1 
        }
        targets.deckB = { 
          filter: lerp(0.3, 0.8, progress), 
          eqLow: lerp(0, 0.3 * buildEnergy, progress), 
          eqMid: lerp(0.3, 0.6, progress), 
          eqHigh: lerp(0.4, 0.7 * buildEnergy, progress), 
          volume: lerp(0.3, 0.7, progress) 
        }
        break
        
      case 'peak':
        // Full energy, both decks balanced
        setCoachMessage(showStrategy || "💥 AI REMIX: PEAK ENERGY!")
        
        // Mastermind can influence peak energy level
        const peakEnergy = Math.max(0.8, energyMod)
        targets.crossfader = 0.5
        targets.deckA = { filter: 1, eqLow: 0.6 * peakEnergy, eqMid: 0.7, eqHigh: 0.8 * peakEnergy, volume: 0.9 }
        targets.deckB = { filter: 1, eqLow: 0.6 * peakEnergy, eqMid: 0.7, eqHigh: 0.8 * peakEnergy, volume: 0.9 }
        break
        
      case 'transition':
        // Smooth crossfade with bass swap - THE KEY TECHNIQUE!
        setCoachMessage(showStrategy || "🔀 AI REMIX: Bass swap transition...")
        const transitionProgress = progress
        
        // Check mastermind's transition style recommendation
        const transStyle = mm?.recommendations?.transitionStyle || 'bass_swap'
        
        if (transStyle === 'cut') {
          // Quick cut transition
          targets.crossfader = progress > 0.5 ? 1 : 0
          targets.deckA = { filter: 1, eqLow: progress > 0.5 ? 0 : 0.7, eqMid: 0.6, eqHigh: 0.6, volume: progress > 0.5 ? 0 : 1 }
          targets.deckB = { filter: 1, eqLow: progress > 0.5 ? 0.7 : 0, eqMid: 0.6, eqHigh: 0.6, volume: progress > 0.5 ? 1 : 0 }
        } else if (transStyle === 'filter_sweep') {
          // Filter sweep transition
          targets.crossfader = lerp(0.5, 0.85, transitionProgress)
          targets.deckA = { 
            filter: lerp(1, 0.2, transitionProgress), 
            eqLow: 0.6, eqMid: 0.6, eqHigh: 0.6, 
            volume: lerp(0.9, 0.2, transitionProgress) 
          }
          targets.deckB = { 
            filter: lerp(0.2, 1, transitionProgress), 
            eqLow: 0.7, eqMid: 0.6, eqHigh: 0.7, 
            volume: lerp(0.3, 1, transitionProgress) 
          }
        } else {
          // Default: Bass swap (the pro technique)
          targets.crossfader = lerp(0.5, 0.85, transitionProgress)
          targets.deckA = { 
            filter: lerp(1, 0.5, transitionProgress), 
            eqLow: lerp(0.6, 0.1, transitionProgress), // Cut bass on outgoing
            eqMid: lerp(0.7, 0.4, transitionProgress), 
            eqHigh: lerp(0.8, 0.5, transitionProgress), 
            volume: lerp(0.9, 0.3, transitionProgress) 
          }
          targets.deckB = { 
            filter: 1, 
            eqLow: lerp(0.3, 0.8, transitionProgress), // Bring in bass on incoming
            eqMid: lerp(0.6, 0.75, transitionProgress), 
            eqHigh: lerp(0.7, 0.8, transitionProgress), 
            volume: lerp(0.7, 1, transitionProgress) 
          }
        }
        break
        
      case 'breakdown':
        // Reduce energy, filter sweep down
        setCoachMessage(showStrategy || "🌙 AI REMIX: Breakdown...")
        setEmotionMode('dreamy')
        
        const breakdownEnergy = Math.min(0.5, energyMod)
        targets.crossfader = 0.6
        targets.deckA = { 
          filter: lerp(0.5, 0.3, progress), 
          eqLow: 0.3 * breakdownEnergy, 
          eqMid: 0.5, 
          eqHigh: 0.4, 
          volume: 0.4 
        }
        targets.deckB = { 
          filter: lerp(1, 0.6, progress), 
          eqLow: 0.5, 
          eqMid: 0.6, 
          eqHigh: lerp(0.8, 0.5, progress) * breakdownEnergy, 
          volume: 0.8 
        }
        break
    }
  }

  // Smooth interpolation towards target values
  useFrame((state, delta) => {
    if (!remixMode) {
      phaseRef.current = 'intro'
      phaseTimeRef.current = 0
      mastermindTimerRef.current = 0
      mixDurationRef.current = 0
      mastermindStrategyRef.current = null
      return
    }
    
    const currentState = useDJStore.getState()
    mixDurationRef.current += delta
    
    // Consult the Mastermind every 5 seconds for high-level strategy
    mastermindTimerRef.current += delta
    if (mastermindTimerRef.current > 5) {
      mastermindTimerRef.current = 0
      consultMastermind()
    }
    
    // Ensure at least deck A is playing
    if (!currentState.deckA.playing && !currentState.deckB.playing) {
      updateDeck('A', { playing: true })
      return
    }
    
    timerRef.current += delta
    phaseTimeRef.current += delta
    
    // Calculate phase progress (0-1)
    const phaseDurations: Record<RemixPhase, number> = {
      intro: 8, building: 12, peak: 16, transition: 10, breakdown: 8
    }
    const phaseProgress = Math.min(1, phaseTimeRef.current / phaseDurations[phaseRef.current])
    
    // Check for phase transition
    const newPhase = calculateNextPhase(phaseRef.current, phaseTimeRef.current)
    if (newPhase !== phaseRef.current) {
      phaseRef.current = newPhase
      phaseTimeRef.current = 0
      addScore(10, `Phase: ${newPhase}`)
    }
    
    // Update targets every 0.5 seconds
    if (timerRef.current > 0.5) {
      timerRef.current = 0
      setTargetsForPhase(phaseRef.current, phaseProgress)
    }
    
    // Smooth interpolation towards targets (every frame)
    const smoothing = 0.02 // Lower = smoother
    const curr = currentValuesRef.current
    const targ = targetStateRef.current
    
    // Interpolate all values smoothly
    curr.crossfader = lerp(curr.crossfader, targ.crossfader, smoothing)
    curr.deckA.filter = lerp(curr.deckA.filter, targ.deckA.filter, smoothing)
    curr.deckA.eqLow = lerp(curr.deckA.eqLow, targ.deckA.eqLow, smoothing)
    curr.deckA.eqMid = lerp(curr.deckA.eqMid, targ.deckA.eqMid, smoothing)
    curr.deckA.eqHigh = lerp(curr.deckA.eqHigh, targ.deckA.eqHigh, smoothing)
    curr.deckA.volume = lerp(curr.deckA.volume, targ.deckA.volume, smoothing)
    curr.deckB.filter = lerp(curr.deckB.filter, targ.deckB.filter, smoothing)
    curr.deckB.eqLow = lerp(curr.deckB.eqLow, targ.deckB.eqLow, smoothing)
    curr.deckB.eqMid = lerp(curr.deckB.eqMid, targ.deckB.eqMid, smoothing)
    curr.deckB.eqHigh = lerp(curr.deckB.eqHigh, targ.deckB.eqHigh, smoothing)
    curr.deckB.volume = lerp(curr.deckB.volume, targ.deckB.volume, smoothing)
    
    // Apply values (throttled to avoid performance issues)
    setCrossfader(curr.crossfader)
    updateDeck('A', { 
      filter: curr.deckA.filter, 
      volume: curr.deckA.volume,
      eq: { low: curr.deckA.eqLow, mid: curr.deckA.eqMid, high: curr.deckA.eqHigh }
    })
    updateDeck('B', { 
      filter: curr.deckB.filter, 
      volume: curr.deckB.volume,
      eq: { low: curr.deckB.eqLow, mid: curr.deckB.eqMid, high: curr.deckB.eqHigh }
    })
  })

  return (
    <group onClick={toggleRemixMode}>
      <RoundedBox args={[0.18, 0.035, 0.1]} radius={0.01}>
        <meshStandardMaterial 
            color={remixMode ? "#f43f5e" : "#222"} 
            emissive={remixMode ? "#f43f5e" : "#000"}
            emissiveIntensity={remixMode ? 0.8 : 0}
        />
      </RoundedBox>
      <Text position={[0, 0.018, 0]} fontSize={0.016} color="white" rotation={[-Math.PI/2, 0, 0]} fontWeight="bold">
          {remixMode ? "🎧 AI MIXING" : "AI REMIX"}
      </Text>
      {remixMode && (
        <Text position={[0, 0.018, 0.03]} fontSize={0.01} color="#fbbf24" rotation={[-Math.PI/2, 0, 0]}>
          {phaseRef.current.toUpperCase()}
        </Text>
      )}
    </group>
  )
}
