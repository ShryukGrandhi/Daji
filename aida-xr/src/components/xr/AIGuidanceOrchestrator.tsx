import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDJStore } from '@/store/useDJStore'
import { AIGuidanceArrow, BeatCountdownBar } from './AIGuidanceSystem'
import { GhostHand, EnergyVisualizer } from './GhostHands'
import { useAIMixingEngine } from '@/hooks/useAIMixingEngine'

// AI Guidance Orchestrator - Uses Gemini to generate real-time suggestions
export function AIGuidanceOrchestrator() {
  // Initialize AI mixing engine (transition, EQ, drop detection)
  useAIMixingEngine()
  
  const aiGuidance = useDJStore((state) => state.aiGuidance)
  const demoMode = useDJStore((state) => state.demoMode)
  const deckA = useDJStore((state) => state.deckA)
  const deckB = useDJStore((state) => state.deckB)
  const crossfader = useDJStore((state) => state.crossfader)
  const setAIGuidance = useDJStore((state) => state.setAIGuidance)
  const setAutoMixSuggestions = useDJStore((state) => state.setAutoMixSuggestions)
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)
  
  const lastAnalysisTime = useRef(0)
  const beatCounter = useRef(0)
  
  // Update beat counter
  useFrame((state, delta) => {
    if (deckA.playing || deckB.playing) {
      const avgBpm = (deckA.bpm + deckB.bpm) / 2
      const beatsPerSecond = avgBpm / 60
      beatCounter.current += beatsPerSecond * delta
      
      // Update beat phase for sync visualization
      const beatPhase = (beatCounter.current % 1)
      useDJStore.getState().updateDeck('A', { beatPhase })
      useDJStore.getState().updateDeck('B', { beatPhase })
    }
  })
  
  // Analyze mix state and generate AI suggestions
  useEffect(() => {
    if (!aiGuidance.active || demoMode) return
    
    const analyzeMix = async () => {
      const now = Date.now()
      if (now - lastAnalysisTime.current < 2000) return // Throttle to every 2 seconds
      lastAnalysisTime.current = now
      
      try {
        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: "Analyze the current mix state and provide visual guidance suggestions. Generate arrows, countdowns, or ghost hand instructions for the next mixing action.",
            state: {
              deckA: {
                playing: deckA.playing,
                volume: deckA.volume,
                filter: deckA.filter,
                eq: deckA.eq,
                bpm: deckA.bpm,
                energyLevel: deckA.energyLevel,
                currentPosition: deckA.currentPosition
              },
              deckB: {
                playing: deckB.playing,
                volume: deckB.volume,
                filter: deckB.filter,
                eq: deckB.eq,
                bpm: deckB.bpm,
                energyLevel: deckB.energyLevel,
                currentPosition: deckB.currentPosition
              },
              crossfader,
              currentBeat: Math.floor(beatCounter.current)
            }
          })
        })
        
        const data = await response.json()
        
        if (data.action === 'AI_GUIDANCE' && data.parameters?.suggestions) {
          setAIGuidance({
            active: true,
            suggestions: data.parameters.suggestions,
            currentBeat: Math.floor(beatCounter.current),
            beatsUntilNextAction: data.parameters.beatsUntilNextAction || 0
          })
          
          if (data.speech) {
            setCoachMessage(data.speech)
          }
        }
        
        if (data.action === 'AUTO_MIX_SUGGESTIONS' && data.parameters) {
          setAutoMixSuggestions(data.parameters)
        }
      } catch (err) {
        console.error('AI Guidance Error:', err)
      }
    }
    
    const interval = setInterval(analyzeMix, 3000) // Analyze every 3 seconds
    return () => clearInterval(interval)
  }, [aiGuidance.active, demoMode, deckA, deckB, crossfader, setAIGuidance, setAutoMixSuggestions, setCoachMessage])
  
  // Don't render anything during demo mode or when guidance is off
  if (!aiGuidance.active || demoMode) return null
  
  return (
    <group>
      {/* Render guidance arrows */}
      {aiGuidance.suggestions
        .filter(s => s.type === 'arrow')
        .map((suggestion, i) => {
          // Map target IDs to positions (simplified - would need actual control positions)
          const positionMap: Record<string, [number, number, number]> = {
            'deckA-eq-high': [-0.7, 0.15, 0.1],
            'deckA-eq-mid': [-0.7, 0.15, 0.05],
            'deckA-eq-low': [-0.7, 0.15, 0],
            'deckA-filter': [-0.7, 0.15, -0.05],
            'deckB-eq-high': [0.7, 0.15, 0.1],
            'deckB-eq-mid': [0.7, 0.15, 0.05],
            'deckB-eq-low': [0.7, 0.15, 0],
            'deckB-filter': [0.7, 0.15, -0.05],
            'crossfader': [0, 0.15, 0.35]
          }
          
          const position = suggestion.position || positionMap[suggestion.target] || [0, 0, 0]
          const direction = suggestion.direction || [0, 1, 0]
          const avgBpm = (deckA.bpm + deckB.bpm) / 2
          
          return (
            <AIGuidanceArrow
              key={suggestion.id}
              targetPosition={position}
              direction={direction}
              label={suggestion.action}
              beatTiming={suggestion.beatsUntil}
              bpm={avgBpm}
            />
          )
        })}
      
      {/* Render ghost hands */}
      {aiGuidance.suggestions
        .filter(s => s.type === 'ghost_hand')
        .map((suggestion) => {
          const position = suggestion.position || [0, 0, 0]
          const action = suggestion.action.includes('rotate') ? 'rotate' : 
                        suggestion.action.includes('slide') ? 'slide' : 'press'
          
          return (
            <GhostHand
              key={suggestion.id}
              targetPosition={position}
              targetRotation={[0, 0, 0]}
              action={action}
              progress={1 - (suggestion.beatsUntil / 8)}
            />
          )
        })}
      
      {/* Beat countdown bar */}
      {aiGuidance.beatsUntilNextAction > 0 && (
        <BeatCountdownBar
          beatsUntilAction={aiGuidance.beatsUntilNextAction}
          totalBeats={8}
          bpm={(deckA.bpm + deckB.bpm) / 2}
        />
      )}
      
      {/* Energy visualizers */}
      <EnergyVisualizer
        deckId="A"
        energy={deckA.energyLevel}
        position={[-0.7, 0.25, -0.2]}
      />
      <EnergyVisualizer
        deckId="B"
        energy={deckB.energyLevel}
        position={[0.7, 0.25, -0.2]}
      />
    </group>
  )
}

