import React, { useRef, useEffect } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import { useDJStore, EmotionMode } from '@/store/useDJStore'
import { useFrame } from '@react-three/fiber'

// Musical phases for the AI remix
type RemixPhase = 'intro' | 'building' | 'peak' | 'transition' | 'breakdown'

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

  // Set target values based on musical phase
  const setTargetsForPhase = (phase: RemixPhase, progress: number) => {
    const state = useDJStore.getState()
    const targets = targetStateRef.current
    
    switch (phase) {
      case 'intro':
        // Start with one deck, clean sound
        setCoachMessage("🎧 AI REMIX: Setting the vibe...")
        targets.crossfader = 0.2
        targets.deckA = { filter: 1, eqLow: 0.7, eqMid: 0.6, eqHigh: 0.5, volume: 1 }
        targets.deckB = { filter: 0.3, eqLow: 0, eqMid: 0.3, eqHigh: 0.4, volume: 0.3 }
        break
        
      case 'building':
        // Gradually bring in more elements, build tension
        setCoachMessage("🔥 AI REMIX: Building energy...")
        setEmotionMode('hype')
        // Gradually open filter and bring in deck B
        targets.crossfader = lerp(0.2, 0.4, progress)
        targets.deckA = { filter: 1, eqLow: lerp(0.7, 0.5, progress), eqMid: 0.7, eqHigh: lerp(0.5, 0.7, progress), volume: 1 }
        targets.deckB = { filter: lerp(0.3, 0.8, progress), eqLow: lerp(0, 0.3, progress), eqMid: lerp(0.3, 0.6, progress), eqHigh: lerp(0.4, 0.7, progress), volume: lerp(0.3, 0.7, progress) }
        break
        
      case 'peak':
        // Full energy, both decks balanced
        setCoachMessage("💥 AI REMIX: PEAK ENERGY!")
        targets.crossfader = 0.5
        targets.deckA = { filter: 1, eqLow: 0.6, eqMid: 0.7, eqHigh: 0.8, volume: 0.9 }
        targets.deckB = { filter: 1, eqLow: 0.6, eqMid: 0.7, eqHigh: 0.8, volume: 0.9 }
        break
        
      case 'transition':
        // Smooth crossfade with bass swap
        setCoachMessage("🔀 AI REMIX: Transitioning tracks...")
        const transitionProgress = progress
        // Bass swap - the key to clean transitions
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
        break
        
      case 'breakdown':
        // Reduce energy, filter sweep down
        setCoachMessage("🌙 AI REMIX: Breakdown...")
        setEmotionMode('dreamy')
        targets.crossfader = 0.6
        targets.deckA = { filter: lerp(0.5, 0.3, progress), eqLow: 0.3, eqMid: 0.5, eqHigh: 0.4, volume: 0.4 }
        targets.deckB = { filter: lerp(1, 0.6, progress), eqLow: 0.5, eqMid: 0.6, eqHigh: lerp(0.8, 0.5, progress), volume: 0.8 }
        break
    }
  }

  // Smooth interpolation towards target values
  useFrame((state, delta) => {
    if (!remixMode) {
      phaseRef.current = 'intro'
      phaseTimeRef.current = 0
      return
    }
    
    const currentState = useDJStore.getState()
    
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
