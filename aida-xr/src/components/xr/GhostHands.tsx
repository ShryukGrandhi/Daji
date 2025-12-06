import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box, Cylinder } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface GhostHandProps {
  targetPosition: [number, number, number]
  targetRotation: [number, number, number]
  action: 'rotate' | 'slide' | 'press'
  progress: number // 0-1
}

export function GhostHand({ targetPosition, targetRotation, action, progress }: GhostHandProps) {
  const handRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (handRef.current) {
      // Smooth interpolation to target
      handRef.current.position.lerp(
        new THREE.Vector3(...targetPosition),
        0.1
      )
      handRef.current.rotation.set(
        THREE.MathUtils.lerp(handRef.current.rotation.x, targetRotation[0], 0.1),
        THREE.MathUtils.lerp(handRef.current.rotation.y, targetRotation[1], 0.1),
        THREE.MathUtils.lerp(handRef.current.rotation.z, targetRotation[2], 0.1)
      )
    }
  })

  return (
    <group ref={handRef} position={targetPosition}>
      {/* Ghost hand (simplified as a glowing sphere/box) */}
      <Box args={[0.08, 0.08, 0.08]}>
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </Box>
      
      {/* Action indicator */}
      <Text
        position={[0, 0.12, 0]}
        fontSize={0.03}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
      >
        {action === 'rotate' ? '↻' : action === 'slide' ? '↔' : '↓'}
      </Text>
      
      {/* Progress ring */}
      <Cylinder args={[0.1, 0.1, 0.01, 32]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </Cylinder>
    </group>
  )
}

interface EnergyVisualizerProps {
  deckId: 'A' | 'B'
  energy: number // 0-1
  position: [number, number, number]
}

export function EnergyVisualizer({ deckId, energy, position }: EnergyVisualizerProps) {
  const color = useMemo(() => {
    if (energy < 0.33) return "#3b82f6" // blue - low
    if (energy < 0.66) return "#fbbf24" // yellow - mid
    return "#ef4444" // red - high
  }, [energy])

  const segments = 20
  const segmentHeight = 0.15 / segments

  return (
    <group position={position}>
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.02}
        color="#888"
        anchorX="center"
        anchorY="middle"
      >
        ENERGY
      </Text>
      
      {/* Energy bar */}
      <Box args={[0.03, 0.15, 0.01]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Energy fill */}
      {Array.from({ length: segments }).map((_, i) => {
        const segmentEnergy = (i + 1) / segments
        const isActive = energy >= segmentEnergy
        const segmentColor = segmentEnergy < 0.33 ? "#3b82f6" : segmentEnergy < 0.66 ? "#fbbf24" : "#ef4444"
        
        return (
          <Box
            key={i}
            args={[0.025, segmentHeight, 0.011]}
            position={[0, -0.075 + (i + 0.5) * segmentHeight, 0.001]}
          >
            <meshStandardMaterial
              color={isActive ? segmentColor : "#222"}
              emissive={isActive ? segmentColor : "#000"}
              emissiveIntensity={isActive ? 0.5 : 0}
            />
          </Box>
        )
      })}
      
      {/* Energy value */}
      <Text
        position={[0, -0.1, 0]}
        fontSize={0.018}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(energy * 100)}%
      </Text>
    </group>
  )
}

