import React from 'react'
import { Text, RoundedBox, Box } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

export function AutoMixSuggestionsPanel() {
  const suggestions = useDJStore((state) => state.autoMixSuggestions)
  const deckA = useDJStore((state) => state.deckA)
  const deckB = useDJStore((state) => state.deckB)
  
  if (!suggestions.trackPairing && !suggestions.transitionType) {
    return null
  }

  return (
    <group>
      <RoundedBox args={[0.55, 0.28, 0.025]} radius={0.015}>
        <meshStandardMaterial 
          color="#0a0a0a" 
          roughness={0.2} 
          metalness={0.8}
          transparent 
          opacity={0.95} 
        />
      </RoundedBox>
      
      {/* Subtle border glow */}
      <RoundedBox args={[0.57, 0.3, 0.01]} radius={0.015} position={[0, 0, -0.01]}>
        <meshStandardMaterial 
          color="#06b6d4" 
          transparent 
          opacity={0.15}
        />
      </RoundedBox>
      
      {/* Header */}
      <Text
        position={[0, 0.12, 0.015]}
        fontSize={0.03}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        AI MIX SUGGESTIONS
      </Text>
      
      {/* Track Pairing */}
      {suggestions.trackPairing && (
        <group position={[0, 0.06, 0.015]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.018}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            {suggestions.trackPairing.trackA} → {suggestions.trackPairing.trackB}
          </Text>
        </group>
      )}
      
      {/* Transition Type */}
      {suggestions.transitionType && (
        <group position={[0, 0.02, 0.015]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.016}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
          >
            Type: {suggestions.transitionType.toUpperCase()}
          </Text>
        </group>
      )}
      
      {/* Ideal Transition Point */}
      {suggestions.idealTransitionPoint && (
        <group position={[0, -0.02, 0.015]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.014}
            color="#888"
            anchorX="center"
            anchorY="middle"
          >
            Transition in {suggestions.idealTransitionPoint} beats
          </Text>
        </group>
      )}
      
      {/* BPM Shift */}
      {suggestions.recommendedBPMShift && (
        <group position={[0, -0.06, 0.015]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.014}
            color="#888"
            anchorX="center"
            anchorY="middle"
          >
            BPM Shift: {suggestions.recommendedBPMShift > 0 ? '+' : ''}{suggestions.recommendedBPMShift.toFixed(1)}
          </Text>
        </group>
      )}
      
      {/* Frequency Cuts */}
      {suggestions.frequencyCuts && (
        <group position={[0, -0.1, 0.015]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.012}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.5}
          >
            Cut {suggestions.frequencyCuts.deck} {Object.keys(suggestions.frequencyCuts.eq).join('/')}
          </Text>
        </group>
      )}
    </group>
  )
}

