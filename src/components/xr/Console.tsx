import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import { Deck } from './Deck'
import { Mixer } from './Mixer'
import { CoachOverlay } from './CoachOverlay'
import { TrackSelection } from './TrackSelection'
import { useDJStore } from '@/store/useDJStore'

export function Console(props: any) {
  const { coachMode } = useDJStore()
  
  return (
    <group {...props}>
      {/* Main Console Body */}
      <RoundedBox args={[1.8, 0.1, 0.8]} radius={0.02} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </RoundedBox>

      {/* Deck A (Left) */}
      <group position={[-0.5, 0.02, 0]}>
        <Deck id="A" label="DECK A" />
      </group>

      {/* Mixer (Center) */}
      <group position={[0, 0.02, 0]}>
        <Mixer />
      </group>

      {/* Deck B (Right) */}
      <group position={[0.5, 0.02, 0]}>
        <Deck id="B" label="DECK B" />
      </group>

      {/* Coach Mode Overlay (Floating Above) */}
      {coachMode && (
        <group position={[0, 0.6, -0.2]}>
          <CoachOverlay />
        </group>
      )}

      {/* Track Selection Shelf (Right Side) */}
      <group position={[1.2, 0.3, 0.2]} rotation={[0, -0.5, 0]}>
          <TrackSelection />
      </group>
    </group>
  )
}

