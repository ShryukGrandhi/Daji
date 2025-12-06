import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box, Cylinder, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface BeatSyncIndicatorProps {
  deckId: 'A' | 'B'
  position: [number, number, number]
}

export function BeatSyncIndicator({ deckId, position }: BeatSyncIndicatorProps) {
  const bpm = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].bpm)
  const beatPhase = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].beatPhase)
  const isSynced = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].isSynced)
  const otherBpm = useDJStore((state) => state[deckId === 'A' ? 'deckB' : 'deckA'].bpm)
  const otherPlaying = useDJStore((state) => state[deckId === 'A' ? 'deckB' : 'deckA'].playing)
  const playing = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].playing)
  
  const deckColor = deckId === 'A' ? "#ef4444" : "#3b82f6"
  const bpmDiff = Math.abs(bpm - otherBpm)
  const isInSync = bpmDiff < 0.5 && playing && otherPlaying
  
  const syncRingRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (syncRingRef.current && isSynced) {
      syncRingRef.current.rotation.z += 0.02
    }
  })
  
  return (
    <group position={position}>
      {/* Sync Status Circle */}
      <Cylinder args={[0.04, 0.04, 0.01, 32]} rotation={[-Math.PI/2, 0, 0]}>
        <meshStandardMaterial
          color={isInSync ? "#10b981" : "#333"}
          emissive={isInSync ? "#10b981" : "#000"}
          emissiveIntensity={isInSync ? 0.8 : 0}
        />
      </Cylinder>
      
      {/* Rotating sync ring when synced */}
      {isSynced && (
        <Cylinder
          ref={syncRingRef}
          args={[0.045, 0.045, 0.011, 32]}
          rotation={[-Math.PI/2, 0, 0]}
        >
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </Cylinder>
      )}
      
      {/* Beat Phase Indicator (circular progress) */}
      <group>
        {Array.from({ length: 8 }).map((_, i) => {
          const segmentPhase = i / 8
          const isActive = beatPhase >= segmentPhase && beatPhase < (i + 1) / 8
          const angle = (i / 8) * Math.PI * 2
          const radius = 0.03
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          
          return (
            <Box
              key={i}
              args={[0.005, 0.02, 0.01]}
              position={[x, y, 0.002]}
              rotation={[0, 0, angle]}
            >
              <meshStandardMaterial
                color={isActive ? deckColor : "#333"}
                emissive={isActive ? deckColor : "#000"}
                emissiveIntensity={isActive ? 0.8 : 0}
              />
            </Box>
          )
        })}
      </group>
      
      {/* BPM Display */}
      <Text
        position={[0, -0.06, 0]}
        fontSize={0.02}
        color={deckColor}
        anchorX="center"
        anchorY="middle"
      >
        {bpm.toFixed(1)}
      </Text>
      
      {/* BPM Difference Indicator */}
      {playing && otherPlaying && bpmDiff > 0.1 && (
        <Text
          position={[0, -0.08, 0]}
          fontSize={0.012}
          color={bpmDiff > 2 ? "#ef4444" : "#f59e0b"}
          anchorX="center"
          anchorY="middle"
        >
          {bpm > otherBpm ? '+' : ''}{bpmDiff.toFixed(1)} BPM
        </Text>
      )}
      
      {/* Sync Status Text */}
      <Text
        position={[0, 0.06, 0]}
        fontSize={0.012}
        color={isInSync ? "#10b981" : "#666"}
        anchorX="center"
        anchorY="middle"
      >
        {isInSync ? "SYNCED" : "NOT SYNCED"}
      </Text>
    </group>
  )
}

