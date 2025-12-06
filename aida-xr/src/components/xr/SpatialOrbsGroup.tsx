import React, { useState } from 'react'
import { Sphere, Text, Line } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function SpatialOrbsGroup() {
  const spatialSources = useDJStore((state) => state.spatialSources)
  const updateSpatialSource = useDJStore((state) => state.updateSpatialSource)
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)

  const Orb = ({ id, type, position, color }: { id: string, type: string, position: [number, number, number], color: string }) => {
      const [active, setActive] = useState(false)
      
      const handleClick = () => {
          // Simple toggle position for MVP demo
          // If far, bring close. If close, push far.
          const isFar = position[2] < -1.5
          const newZ = isFar ? -0.5 : -2
          const newPos: [number, number, number] = [position[0], position[1], newZ]
          
          updateSpatialSource(id, newPos)
          setCoachMessage(`Spatial: Moved ${type} ${isFar ? 'Closer' : 'Farther'}`)
          
          setActive(true)
          setTimeout(() => setActive(false), 200)
      }

      return (
          <group position={position} onClick={handleClick}>
              <Sphere args={[0.1, 32, 32]}>
                  <meshStandardMaterial 
                    color={color} 
                    emissive={color}
                    emissiveIntensity={active ? 1 : 0.2}
                    transparent
                    opacity={0.8}
                  />
              </Sphere>
              <Text position={[0, 0.15, 0]} fontSize={0.05} color="white" anchorX="center">
                  {type}
              </Text>
              {/* Vertical Line to 'floor' for depth reference */}
              <mesh position={[0, -position[1]/2, 0]}>
                  <cylinderGeometry args={[0.005, 0.005, position[1], 8]} />
                  <meshBasicMaterial color={color} opacity={0.3} transparent />
              </mesh>
          </group>
      )
  }

  return (
    <group>
      {spatialSources.map((src) => (
          <Orb 
            key={src.id} 
            id={src.id} 
            type={src.type === 'deckA' ? 'DECK A' : 'DECK B'} 
            position={src.position} 
            color={src.type === 'deckA' ? '#ef4444' : '#3b82f6'} 
          />
      ))}
      
      {/* Listener Head Reference */}
      <group position={[0, 0, 0]}>
          <Sphere args={[0.15, 16, 16]} scale={[1, 1.2, 1]}>
              <meshBasicMaterial color="#333" wireframe opacity={0.2} transparent />
          </Sphere>
          <Text position={[0, 0.2, 0]} fontSize={0.03} color="#666">YOU</Text>
      </group>
    </group>
  )
}


