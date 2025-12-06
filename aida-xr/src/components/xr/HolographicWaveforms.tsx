import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDJStore } from '@/store/useDJStore'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface HolographicWaveformsProps {
  deckId: 'A' | 'B'
}

export function HolographicWaveforms({ deckId }: HolographicWaveformsProps) {
  const playing = useDJStore((state) => deckId === 'A' ? state.deckA.playing : state.deckB.playing)
  const bpm = useDJStore((state) => deckId === 'A' ? state.deckA.bpm : state.deckB.bpm)
  
  const color = deckId === 'A' ? "#ef4444" : "#3b82f6"
  const bars = 16
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.elapsedTime
    const speed = playing ? (bpm / 60) * 2 : 0.3
    
    ref.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const noise = Math.sin(time * speed + i * 0.8) * Math.cos(time * speed * 0.5 + i * 0.3)
        const baseHeight = playing ? 0.03 + Math.abs(noise) * 0.08 : 0.015
        
        child.scale.y = THREE.MathUtils.lerp(child.scale.y, baseHeight, 0.15)
        child.position.y = child.scale.y / 2
        
        if (child.material instanceof THREE.MeshBasicMaterial) {
            child.material.opacity = playing ? 0.7 + Math.sin(time * 3 + i) * 0.2 : 0.3
        }
      }
    })
  })

  return (
    <group ref={ref}>
      {Array.from({ length: bars }).map((_, i) => (
        <mesh key={i} position={[(i - bars / 2) * 0.02, 0, 0]}>
          <boxGeometry args={[0.012, 1, 0.012]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}
