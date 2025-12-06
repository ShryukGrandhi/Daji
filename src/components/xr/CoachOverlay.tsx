import React from 'react'
import { Text, Plane } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

export function CoachOverlay() {
  const message = useDJStore((state) => state.coachMessage)

  return (
    <group billboard>
        {/* Glass Panel */}
        <Plane args={[1, 0.3]}>
            <meshPhysicalMaterial 
                color="#000" 
                transmission={0.6} 
                opacity={0.8} 
                transparent 
                roughness={0} 
                ior={1.5} 
                thickness={0.05}
            />
        </Plane>
        
        {/* Border Glow */}
        <Plane args={[1.02, 0.32]} position={[0, 0, -0.001]}>
             <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
        </Plane>

        {/* Text Content */}
        <Text
            position={[0, 0.05, 0.01]}
            fontSize={0.05}
            maxWidth={0.9}
            color="#06b6d4"
            anchorX="center"
            anchorY="middle"
            textAlign="center"
        >
            AIDA COACH
        </Text>
        
        <Text
            position={[0, -0.02, 0.01]}
            fontSize={0.035}
            maxWidth={0.9}
            color="#fff"
            anchorX="center"
            anchorY="top"
            textAlign="center"
        >
            {message}
        </Text>
    </group>
  )
}


