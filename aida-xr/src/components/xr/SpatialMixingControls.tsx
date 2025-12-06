import React, { useState, useRef } from 'react'
import { Box, Text, Plane } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

export function SpatialMixingControls() {
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)
  const [puckPos, setPuckPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const planeRef = useRef<THREE.Mesh>(null)

  const updateDeck = useDJStore((state) => state.updateDeck)

  const handlePointerMove = (e: any) => {
    if (!isDragging) return
    e.stopPropagation()
    
    // Convert intersection point to local coordinates
    const point = e.point
    if (planeRef.current) {
        const localPoint = planeRef.current.worldToLocal(point.clone())
        
        // Clamp to bounds (-0.5 to 0.5 locally)
        const x = Math.max(-0.5, Math.min(0.5, localPoint.x))
        const y = Math.max(-0.5, Math.min(0.5, localPoint.z)) // z is 'up' on the flat plane
        
        setPuckPos({ x, y })
        
        // Map X (-0.5 to 0.5) to Filter for both decks (Low Pass to High Pass)
        // Map Y (-0.5 to 0.5) to Reverb Wet (0 to 0.5)
        
        const filterVal = ((x * 2) + 1) / 2 // 0 to 1
        const reverbVal = Math.max(0, y * 2) // 0 to 0.5 (only top half triggers reverb)

        // Apply to BOTH decks for a "Master FX" feel
        updateDeck('A', { filter: filterVal, reverb: reverbVal })
        updateDeck('B', { filter: filterVal, reverb: reverbVal })
        
        setCoachMessage(`Spatial FX: Filter ${(filterVal*100).toFixed(0)}% | Reverb ${(reverbVal*200).toFixed(0)}%`)
    }
  }

  return (
    <group>
      <Text position={[0, 0.02, -0.18]} fontSize={0.025} rotation={[-Math.PI/2, 0, 0]} color="#60a5fa">
        SPATIAL MIXER
      </Text>

      {/* Pad Base */}
      <Box args={[0.3, 0.01, 0.3]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>

      {/* Interactive Plane (Invisible but captures events) */}
      <mesh 
        ref={planeRef} 
        rotation={[-Math.PI/2, 0, 0]} 
        position={[0, 0.011, 0]}
        onPointerDown={(e) => {
            e.stopPropagation()
            setIsDragging(true)
            // @ts-ignore
            e.target.setPointerCapture(e.pointerId)
        }}
        onPointerUp={(e) => {
            e.stopPropagation()
            setIsDragging(false)
            // @ts-ignore
            e.target.releasePointerCapture(e.pointerId)
        }}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial color="white" transparent opacity={0.1} wireframe />
      </mesh>

      {/* Grid Lines */}
      <Box args={[0.002, 0.011, 0.3]} position={[0, 0, 0]}>
         <meshBasicMaterial color="#334155" />
      </Box>
      <Box args={[0.3, 0.011, 0.002]} position={[0, 0, 0]}>
         <meshBasicMaterial color="#334155" />
      </Box>

      {/* Puck */}
      <group position={[puckPos.x * 0.3, 0.02, puckPos.y * 0.3]}> {/* Multiplier adjusts visual scale vs logical scale */}
         <Box args={[0.04, 0.015, 0.04]}>
            <meshStandardMaterial color={isDragging ? "#60a5fa" : "#3b82f6"} emissive="#3b82f6" emissiveIntensity={0.5} />
         </Box>
      </group>
    </group>
  )
}

