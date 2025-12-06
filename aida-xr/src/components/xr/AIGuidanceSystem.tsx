import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface AIGuidanceArrowProps {
  targetPosition: [number, number, number]
  direction: [number, number, number]
  label: string
  beatTiming: number // beats until action
  bpm: number
  color?: string
}

export function AIGuidanceArrow({ 
  targetPosition, 
  direction, 
  label, 
  beatTiming, 
  bpm,
  color = "#06b6d4"
}: AIGuidanceArrowProps) {
  const arrowRef = useRef<THREE.Group>(null)
  const [pulseScale, setPulseScale] = React.useState(1)
  
  // Pulse animation based on beat timing
  useFrame((state) => {
    if (arrowRef.current) {
      const beatTime = (60 / bpm) * beatTiming
      const pulse = 1 + Math.sin(state.clock.elapsedTime * (bpm / 60) * Math.PI * 2) * 0.2
      setPulseScale(pulse)
      arrowRef.current.scale.setScalar(pulse)
      
      // Fade out as timing approaches
      const fade = Math.max(0, Math.min(1, beatTiming / 4))
      arrowRef.current.children.forEach((child: any) => {
        if (child.material) {
          child.material.opacity = fade
        }
      })
    }
  })

  const arrowLength = 0.15
  const arrowEnd: [number, number, number] = [
    targetPosition[0] + direction[0] * arrowLength,
    targetPosition[1] + direction[1] * arrowLength,
    targetPosition[2] + direction[2] * arrowLength
  ]

  // Create arrow using Three.js geometry
  const arrowHelperRef = useRef<THREE.ArrowHelper | null>(null)
  
  useEffect(() => {
    if (!arrowRef.current) return
    
    // Remove old arrow if it exists
    if (arrowHelperRef.current) {
      arrowRef.current.remove(arrowHelperRef.current)
      arrowHelperRef.current = null
    }
    
    // Create new arrow with current direction
    const dir = new THREE.Vector3(...direction).normalize()
    const origin = new THREE.Vector3(0, 0, 0)
    const length = arrowLength
    const hex = new THREE.Color(color).getHex()
    
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, length * 0.2, length * 0.15)
    arrowRef.current.add(arrowHelper)
    arrowHelperRef.current = arrowHelper
    
    return () => {
      if (arrowHelperRef.current && arrowRef.current) {
        arrowRef.current.remove(arrowHelperRef.current)
        arrowHelperRef.current = null
      }
    }
  }, [direction, arrowLength, color])

  return (
    <group ref={arrowRef} position={targetPosition}>
      <Text
        position={[direction[0] * arrowLength * 1.2, direction[1] * arrowLength * 1.2 + 0.02, direction[2] * arrowLength * 1.2]}
        fontSize={0.025}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000"
      >
        {label}
      </Text>
      {beatTiming > 0 && (
        <Text
          position={[0, 0.05, 0]}
          fontSize={0.02}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {Math.ceil(beatTiming)} beats
        </Text>
      )}
    </group>
  )
}

interface BeatCountdownBarProps {
  beatsUntilAction: number
  totalBeats: number
  bpm: number
}

export function BeatCountdownBar({ beatsUntilAction, totalBeats, bpm }: BeatCountdownBarProps) {
  const progress = Math.max(0, Math.min(1, beatsUntilAction / totalBeats))
  
  return (
    <group position={[0, 1.6, -1.0]}>
      {/* Background bar */}
      <Box args={[1.5, 0.05, 0.02]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Progress fill */}
      <Box 
        args={[1.5 * (1 - progress), 0.04, 0.021]} 
        position={[-1.5 * progress / 2, 0, 0.001]}
      >
        <meshStandardMaterial 
          color={progress < 0.2 ? "#ef4444" : progress < 0.5 ? "#f59e0b" : "#10b981"}
          emissive={progress < 0.2 ? "#ef4444" : progress < 0.5 ? "#f59e0b" : "#10b981"}
          emissiveIntensity={0.5}
        />
      </Box>
      
      {/* Beat markers */}
      {Array.from({ length: totalBeats + 1 }).map((_, i) => (
        <Box
          key={i}
          args={[0.002, 0.05, 0.01]}
          position={[-0.75 + (i / totalBeats) * 1.5, 0, 0.001]}
        >
          <meshStandardMaterial color={i <= beatsUntilAction ? "#fff" : "#666"} />
        </Box>
      ))}
      
      {/* Countdown text */}
      <Text
        position={[0, 0.08, 0]}
        fontSize={0.04}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {beatsUntilAction > 0 ? `${Math.ceil(beatsUntilAction)} beats until action` : "ACTION NOW!"}
      </Text>
    </group>
  )
}

