import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Cylinder, Box } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface DeckProps {
  id: 'A' | 'B'
  label: string
}

export function Deck({ id, label }: DeckProps) {
  const deckState = useDJStore((state) => (id === 'A' ? state.deckA : state.deckB))
  const updateDeck = useDJStore((state) => state.updateDeck)
  const platterRef = useRef<THREE.Group>(null)

  // Rotate platter if playing
  useFrame((state, delta) => {
    if (deckState.playing && platterRef.current) {
      platterRef.current.rotation.y += delta * (deckState.bpm / 60) * 2 
    }
  })

  const togglePlay = () => {
    updateDeck(id, { playing: !deckState.playing })
  }

  return (
    <group>
      {/* Label */}
      <Text
        position={[0, 0.01, -0.25]}
        fontSize={0.05}
        color="#888"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>

      {/* Track Info */}
      <Text
        position={[0, 0.01, 0.25]}
        fontSize={0.03}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {deckState.track} ({deckState.bpm} BPM)
      </Text>

      {/* Platter Base */}
      <group ref={platterRef} position={[0, 0.02, 0]}>
        <Cylinder args={[0.3, 0.3, 0.02, 64]}>
          <meshStandardMaterial color="#111" roughness={0.5} metalness={0.5} />
        </Cylinder>
        {/* Moving Ring Indicator */}
        <Cylinder args={[0.28, 0.28, 0.021, 64]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#222" />
        </Cylinder>
        <Box args={[0.02, 0.025, 0.2]} position={[0.15, 0.015, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
        </Box>
      </group>

      {/* Play Button */}
      <group position={[-0.2, 0.02, 0.2]} onClick={togglePlay}>
        <Box args={[0.08, 0.02, 0.08]}>
          <meshStandardMaterial 
            color={deckState.playing ? "#10b981" : "#333"} 
            emissive={deckState.playing ? "#10b981" : "#000"}
            emissiveIntensity={deckState.playing ? 0.5 : 0}
          />
        </Box>
        <Text
          position={[0, 0.011, 0]}
          fontSize={0.02}
          color="#fff"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {deckState.playing ? "||" : ">"}
        </Text>
      </group>

      {/* Filter Knob (Simple Vis) */}
      <group position={[0.2, 0.05, -0.2]}>
          <Cylinder args={[0.04, 0.04, 0.05, 32]} rotation={[0, 0, 0]}>
              <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
          </Cylinder>
          <Text position={[0, 0.03, 0.06]} fontSize={0.02} rotation={[-Math.PI/2, 0, 0]} color="white">FILTER</Text>
      </group>
    </group>
  )
}



