import React, { useRef, useState } from 'react'
import { Text, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface Suggestion {
  text: string
  action: () => void
}

export function AIDJHelper() {
  const groupRef = useRef<THREE.Group>(null)
  
  const coachMessage = useDJStore((state) => state.coachMessage)
  const deckAPlaying = useDJStore((state) => state.deckA.playing)
  const deckBPlaying = useDJStore((state) => state.deckB.playing)
  const djScore = useDJStore((state) => state.djScore)
  const djLevel = useDJStore((state) => state.djLevel)
  const crossfader = useDJStore((state) => state.crossfader)
  
  const updateDeck = useDJStore((state) => state.updateDeck)
  const setCrossfader = useDJStore((state) => state.setCrossfader)
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)
  const setEmotionMode = useDJStore((state) => state.setEmotionMode)
  const addScore = useDJStore((state) => state.addScore)

  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null)

  // Generate smart suggestions based on current state
  const getSuggestion = (): Suggestion => {
    const state = useDJStore.getState()
    
    // Check various conditions and suggest appropriate actions
    if (!state.deckA.playing && !state.deckB.playing) {
      return {
        text: "▶ Start Deck A",
        action: () => {
          updateDeck('A', { playing: true })
          setCoachMessage("Started Deck A!")
          addScore(5, "Started mixing!")
        }
      }
    }
    
    if (state.deckA.playing && !state.deckB.playing && state.crossfader < 0.3) {
      return {
        text: "▶ Bring in Deck B",
        action: () => {
          updateDeck('B', { playing: true, filter: 0.5, volume: 0.6 })
          setCoachMessage("Deck B coming in filtered...")
          addScore(10, "Good layering!")
        }
      }
    }
    
    if (state.deckA.playing && state.deckB.playing && state.crossfader < 0.4) {
      return {
        text: "⟹ Fade to Deck B",
        action: () => {
          // Animate crossfader
          let val = state.crossfader
          const interval = setInterval(() => {
            val += 0.05
            if (val >= 0.7) {
              clearInterval(interval)
              setCrossfader(0.7)
              setCoachMessage("Transitioned to Deck B!")
              addScore(15, "Smooth transition!")
            } else {
              setCrossfader(val)
            }
          }, 100)
        }
      }
    }
    
    if (state.deckA.eq.low > 0.4 && state.deckB.playing) {
      return {
        text: "⬇ Cut Bass on A",
        action: () => {
          updateDeck('A', { eq: { low: 0.2, mid: 0.5, high: 0.5 }})
          setCoachMessage("Bass cut on A - cleaner mix!")
          addScore(10, "Smart EQ move!")
        }
      }
    }
    
    if (state.emotionMode === 'neutral') {
      return {
        text: "🔥 Add Energy (Hype)",
        action: () => {
          setEmotionMode('hype')
          setCoachMessage("Energy boost activated!")
          addScore(5, "Vibe change!")
        }
      }
    }
    
    if (state.deckB.filter < 0.8 && state.deckB.playing) {
      return {
        text: "↑ Open Filter B",
        action: () => {
          updateDeck('B', { filter: 1 })
          setCoachMessage("Filter opened on B!")
        }
      }
    }

    // Default
    return {
      text: "🎵 Apply Reverb",
      action: () => {
        updateDeck('A', { reverb: 0.3 })
        updateDeck('B', { reverb: 0.3 })
        setCoachMessage("Added space with reverb")
      }
    }
  }

  const handleSuggestClick = () => {
    const suggestion = getSuggestion()
    setCurrentSuggestion(suggestion)
    setCoachMessage(`💡 ${suggestion.text}`)
  }

  const handleDoIt = () => {
    if (currentSuggestion) {
      currentSuggestion.action()
      setCurrentSuggestion(null)
    }
  }

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.01
    }
  })

  const isActive = deckAPlaying || deckBPlaying

  return (
    <group ref={groupRef}>
      {/* Main panel background */}
      <RoundedBox args={[1.0, 0.45, 0.02]} radius={0.02}>
        <meshStandardMaterial 
          color="#0a0a0a" 
          roughness={0.3} 
          metalness={0.8}
          transparent
          opacity={0.95}
        />
      </RoundedBox>

      {/* Top accent bar */}
      <mesh position={[0, 0.2, 0.011]}>
        <planeGeometry args={[0.95, 0.015]} />
        <meshBasicMaterial color={isActive ? "#06b6d4" : "#6366f1"} />
      </mesh>

      {/* Header */}
      <Text
        position={[-0.4, 0.16, 0.015]}
        fontSize={0.03}
        color="#fff"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
      >
        AIDA COACH
      </Text>

      {/* Score Display */}
      <Text position={[0.35, 0.16, 0.015]} fontSize={0.025} color="#fbbf24" anchorX="right">
        {djLevel} • {djScore}pts
      </Text>

      {/* Main Message Area */}
      <Text
        position={[0, 0.02, 0.015]}
        fontSize={0.028}
        color="#e5e5e5"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.9}
        textAlign="center"
      >
        {coachMessage || "Ready to mix!"}
      </Text>

      {/* Suggestion Button */}
      <group position={[-0.25, -0.12, 0.02]} onClick={handleSuggestClick}>
        <RoundedBox args={[0.22, 0.06, 0.015]} radius={0.01}>
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} />
        </RoundedBox>
        <Text position={[0, 0, 0.01]} fontSize={0.018} color="white" fontWeight="bold">
          WHAT'S NEXT?
        </Text>
      </group>

      {/* Do It Button (only shows when suggestion active) */}
      {currentSuggestion && (
        <group position={[0.15, -0.12, 0.02]} onClick={handleDoIt}>
          <RoundedBox args={[0.25, 0.06, 0.015]} radius={0.01}>
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
          </RoundedBox>
          <Text position={[0, 0, 0.01]} fontSize={0.016} color="white" fontWeight="bold">
            DO IT! ▶
          </Text>
        </group>
      )}

      {/* Deck Status */}
      <Text
        position={[-0.25, -0.19, 0.012]}
        fontSize={0.015}
        color={deckAPlaying ? "#22c55e" : "#525252"}
        anchorX="center"
      >
        A: {deckAPlaying ? "▶" : "■"}
      </Text>
      <Text
        position={[0, -0.19, 0.012]}
        fontSize={0.015}
        color="#666"
        anchorX="center"
      >
        FADE: {(crossfader * 100).toFixed(0)}%
      </Text>
      <Text
        position={[0.25, -0.19, 0.012]}
        fontSize={0.015}
        color={deckBPlaying ? "#22c55e" : "#525252"}
        anchorX="center"
      >
        B: {deckBPlaying ? "▶" : "■"}
      </Text>
    </group>
  )
}
