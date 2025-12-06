import React from 'react'
import { Text, Plane, Billboard } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

// Re-created
export function CoachOverlay() {
  const message = useDJStore((state) => state.coachMessage)

  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Plane args={[1.2, 0.35]}>
            <meshPhysicalMaterial 
                color="#000" 
                transmission={0.6} 
                opacity={0.8} 
                transparent 
                roughness={0.1} 
                ior={1.5} 
                thickness={0.05}
            />
        </Plane>
        
        <Plane args={[1.22, 0.37]} position={[0, 0, -0.001]}>
             <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
        </Plane>

        <Plane args={[0.1, 0.1]} position={[-0.5, 0, 0.01]}>
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.8} />
        </Plane>

        <Text
            position={[0.05, 0.05, 0.01]}
            fontSize={0.05}
            maxWidth={0.9}
            color="#06b6d4"
            anchorX="center"
            anchorY="middle"
            textAlign="left"
        >
            AIDA COACH
        </Text>
        
        <Text
            position={[0.05, -0.03, 0.01]}
            fontSize={0.035}
            maxWidth={0.9}
            color="#fff"
            anchorX="center"
            anchorY="top"
            textAlign="left"
        >
            {message}
        </Text>
    </Billboard>
  )
}
