import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface ZoomOnActionProps {
  children: React.ReactNode
}

export function ZoomOnAction({ children }: ZoomOnActionProps) {
  const aiGuidance = useDJStore((state) => state.aiGuidance)
  const groupRef = useRef<THREE.Group>(null)
  const cameraRef = useRef<THREE.Camera | null>(null)
  
  useFrame((state) => {
    if (!groupRef.current) return
    cameraRef.current = state.camera
    
    // Check if AI is suggesting an action
    const hasActiveSuggestion = aiGuidance.active && aiGuidance.suggestions.length > 0
    
    if (hasActiveSuggestion) {
      // Find the target control from suggestions
      const targetSuggestion = aiGuidance.suggestions[0]
      const targetId = targetSuggestion.target
      
      // Map target IDs to zoom positions (simplified - would need actual control positions)
      const zoomMap: Record<string, { position: [number, number, number], scale: number }> = {
        'deckA-eq-high': { position: [-0.7, 0.15, 0.1], scale: 1.5 },
        'deckA-eq-mid': { position: [-0.7, 0.15, 0.05], scale: 1.5 },
        'deckA-eq-low': { position: [-0.7, 0.15, 0], scale: 1.5 },
        'deckA-filter': { position: [-0.7, 0.15, -0.05], scale: 1.5 },
        'deckB-eq-high': { position: [0.7, 0.15, 0.1], scale: 1.5 },
        'deckB-eq-mid': { position: [0.7, 0.15, 0.05], scale: 1.5 },
        'deckB-eq-low': { position: [0.7, 0.15, 0], scale: 1.5 },
        'deckB-filter': { position: [0.7, 0.15, -0.05], scale: 1.5 },
        'crossfader': { position: [0, 0.15, 0.35], scale: 1.3 }
      }
      
      const zoomTarget = zoomMap[targetId]
      
      if (zoomTarget && cameraRef.current) {
        // Smoothly zoom camera towards target
        const targetPos = new THREE.Vector3(...zoomTarget.position)
        const currentPos = cameraRef.current.position.clone()
        const lerpPos = currentPos.lerp(targetPos, 0.05)
        
        // Only zoom if we're not already close
        if (currentPos.distanceTo(targetPos) > 0.1) {
          cameraRef.current.position.copy(lerpPos)
          // Also adjust look-at to focus on target
          const lookAt = new THREE.Vector3(...zoomTarget.position)
          cameraRef.current.lookAt(lookAt)
        }
      }
    } else {
      // Return to default camera position
      if (cameraRef.current) {
        const defaultPos = new THREE.Vector3(0, 1.7, 0.8)
        cameraRef.current.position.lerp(defaultPos, 0.02)
        cameraRef.current.lookAt(0, 1.1, -0.5)
      }
    }
  })
  
  return <group ref={groupRef}>{children}</group>
}

// Highlight component for controls when AI suggests them
export function ControlHighlight({ controlId, active }: { controlId: string, active: boolean }) {
  if (!active) return null
  
  return (
    <group>
      {/* Pulsing glow ring around control */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[0.05, 0.06, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

