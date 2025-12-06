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
          
          // Phase-based DJ logic driven by AI Agent
          if (remixMode) {
             fetch('/api/agent', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                     message: "Perform the next best mixing step based on the current state to make it sound professional. If in a drop, keep energy high. If transitioning, be smooth.",
                     state: {
                         deckA: { playing: currentState.deckA.playing, volume: currentState.deckA.volume, filter: currentState.deckA.filter, eq: currentState.deckA.eq },
                         deckB: { playing: currentState.deckB.playing, volume: currentState.deckB.volume, filter: currentState.deckB.filter, eq: currentState.deckB.eq },
                         crossfader: currentState.crossfader,
                         emotionMode: currentState.emotionMode
                     }
                 })
             })
             .then(res => res.json())
             .then(data => {
                 if (data.speech) setCoachMessage(`🎧 AI: ${data.speech}`);
                 
                 // Handle AI_REMIX_STEP generic updates
                 if (data.action === 'AI_REMIX_STEP' && data.parameters?.updates) {
                     data.parameters.updates.forEach((u: any) => {
                         if (u.type === 'deck') {
                             updateDeck(u.deck, { ...u });
                         } else if (u.type === 'mixer') {
                             if (u.crossfader !== undefined) setCrossfader(u.crossfader);
                         } else if (u.type === 'emotion') {
                             if (u.mode) setEmotionMode(u.mode);
                         }
                     });
                 }
                 // Handle specific actions
                 else if (data.action === 'SET_CROSSFADER') setCrossfader(data.parameters.value);
                 else if (data.action === 'SET_FILTER') updateDeck(data.parameters.deck, { filter: data.parameters.value });
                 else if (data.action === 'SET_EQ') updateDeck(data.parameters.deck, { eq: { ...data.parameters } });
                 else if (data.action === 'PLAY') updateDeck(data.parameters.deck, { playing: true });
                 else if (data.action === 'STOP') updateDeck(data.parameters.deck, { playing: false });
                 else if (data.action === 'EMOTION_MODE') setEmotionMode(data.parameters.mode);
             })
             .catch(err => console.error("AI Remix Error:", err));
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
