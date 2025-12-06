import React, { useRef } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import { useDJStore, EmotionMode } from '@/store/useDJStore'
import { useFrame } from '@react-three/fiber'

export function RemixModeToggle() {
  const remixMode = useDJStore((state) => state.remixMode)
  const toggleRemixMode = useDJStore((state) => state.toggleRemixMode)
  const updateDeck = useDJStore((state) => state.updateDeck)
  const setEmotionMode = useDJStore((state) => state.setEmotionMode)
  const setCrossfader = useDJStore((state) => state.setCrossfader)
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)
  const addScore = useDJStore((state) => state.addScore)
  
  const timerRef = useRef(0)
  const phaseRef = useRef(0) // Track remix phase: 0=intro, 1=buildup, 2=drop, 3=breakdown
  const actionCountRef = useRef(0)

  // AI Remix Logic - Actually does smart DJ moves
  useFrame((state, delta) => {
      if (!remixMode) {
          phaseRef.current = 0
          actionCountRef.current = 0
          return
      }
      
      timerRef.current += delta
      
      // Every 3 seconds, make a smart decision based on phase
      if (timerRef.current > 3) {
          timerRef.current = 0
          actionCountRef.current++
          
          const phase = phaseRef.current
          const currentState = useDJStore.getState()
          
          // Phase-based DJ logic
          if (phase === 0) {
              // INTRO: Start deck A, gentle filter, fade it in
              if (actionCountRef.current === 1) {
                  updateDeck('A', { playing: true, filter: 0.6, volume: 0.7 })
                  setCoachMessage("🎧 AI: Starting with filtered intro...")
              } else if (actionCountRef.current === 2) {
                  updateDeck('A', { filter: 0.8 })
                  setCoachMessage("🎧 AI: Opening up the filter...")
              } else if (actionCountRef.current === 3) {
                  updateDeck('A', { filter: 1, volume: 1 })
                  setCoachMessage("🎧 AI: Full power on Deck A!")
                  phaseRef.current = 1
                  actionCountRef.current = 0
              }
          } else if (phase === 1) {
              // BUILDUP: Bring in deck B, start crossfading
              if (actionCountRef.current === 1) {
                  updateDeck('B', { playing: true, filter: 0.4, volume: 0.5 })
                  setCoachMessage("🎧 AI: Bringing in Deck B underneath...")
              } else if (actionCountRef.current === 2) {
                  setCrossfader(0.3)
                  updateDeck('B', { filter: 0.6 })
                  setCoachMessage("🎧 AI: Building tension...")
                  setEmotionMode('hype')
              } else if (actionCountRef.current === 3) {
                  setCrossfader(0.4)
                  updateDeck('A', { eq: { low: 0.3, mid: 0.5, high: 0.5 }})
                  setCoachMessage("🎧 AI: Cutting bass on A for the drop...")
              } else if (actionCountRef.current === 4) {
                  // THE DROP
                  setCrossfader(0.6)
                  updateDeck('A', { eq: { low: 0.5, mid: 0.5, high: 0.5 }, filter: 0.7 })
                  updateDeck('B', { filter: 1, volume: 1 })
                  setEmotionMode('aggressive')
                  setCoachMessage("💥 AI: DROP! Deck B takes over!")
                  addScore(25, "Perfect AI Drop!")
                  phaseRef.current = 2
                  actionCountRef.current = 0
              }
          } else if (phase === 2) {
              // DROP: Ride the energy
              if (actionCountRef.current === 1) {
                  setCrossfader(0.8)
                  setCoachMessage("🎧 AI: Riding the energy...")
              } else if (actionCountRef.current === 2) {
                  setCrossfader(1)
                  updateDeck('A', { playing: false })
                  setCoachMessage("🎧 AI: Full Deck B!")
              } else if (actionCountRef.current === 3) {
                  setEmotionMode('dreamy')
                  updateDeck('B', { reverb: 0.3 })
                  setCoachMessage("🎧 AI: Adding space for breakdown...")
                  phaseRef.current = 3
                  actionCountRef.current = 0
              }
          } else if (phase === 3) {
              // BREAKDOWN: Calm down, prepare next cycle
              if (actionCountRef.current === 1) {
                  updateDeck('B', { filter: 0.7, reverb: 0.5 })
                  setCoachMessage("🎧 AI: Filtering down...")
              } else if (actionCountRef.current === 2) {
                  setEmotionMode('neutral')
                  updateDeck('B', { reverb: 0, filter: 1 })
                  setCoachMessage("🎧 AI: Back to clean...")
              } else if (actionCountRef.current === 3) {
                  // Reset for next cycle
                  setCrossfader(0.5)
                  updateDeck('A', { playing: true, filter: 0.5, volume: 0.5 })
                  setCoachMessage("🎧 AI: Starting new cycle...")
                  addScore(10, "AI Mix Cycle Complete!")
                  phaseRef.current = 0
                  actionCountRef.current = 0
              }
          }
      }
  })

  return (
    <group onClick={toggleRemixMode}>
      <RoundedBox args={[0.15, 0.03, 0.08]} radius={0.01}>
        <meshStandardMaterial 
            color={remixMode ? "#f43f5e" : "#222"} 
            emissive={remixMode ? "#f43f5e" : "#000"}
            emissiveIntensity={remixMode ? 0.8 : 0}
        />
      </RoundedBox>
      <Text position={[0, 0.016, 0]} fontSize={0.018} color="white" rotation={[-Math.PI/2, 0, 0]} fontWeight="bold">
          {remixMode ? "AI ON" : "AI MIX"}
      </Text>
    </group>
  )
}
