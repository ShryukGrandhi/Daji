import React from 'react'
import { Box, Cylinder, Text } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

export function Mixer() {
  const crossfader = useDJStore((state) => state.crossfader)
  // In a real app, we'd make this interactive with use-gesture or XR controllers
  // For now, it visualizes the state (which voice can change)

  return (
    <group>
      {/* Mixer Body */}
      <Box args={[0.4, 0.05, 0.7]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#222" roughness={0.3} />
      </Box>

      {/* Crossfader Area */}
      <group position={[0, 0.04, 0.25]}>
        <Text position={[0, 0, -0.08]} fontSize={0.02} rotation={[-Math.PI/2, 0, 0]} color="#aaa">CROSSFADER</Text>
        {/* Track */}
        <Box args={[0.3, 0.01, 0.02]}>
          <meshStandardMaterial color="#000" />
        </Box>
        {/* Handle */}
        <Box 
            args={[0.03, 0.04, 0.05]} 
            position={[(crossfader - 0.5) * 0.3, 0.02, 0]} // Map 0..1 to -0.15..0.15
        >
           <meshStandardMaterial color="#fff" />
        </Box>
      </group>

      {/* EQ Section */}
      <group position={[-0.1, 0.04, -0.1]}>
         <EQKnob label="LOW A" color="#3b82f6" />
      </group>
      <group position={[0.1, 0.04, -0.1]}>
         <EQKnob label="LOW B" color="#3b82f6" />
      </group>
      
      <group position={[-0.1, 0.04, 0]}>
         <EQKnob label="HIGH A" color="#eab308" />
      </group>
      <group position={[0.1, 0.04, 0]}>
         <EQKnob label="HIGH B" color="#eab308" />
      </group>

    </group>
  )
}

function EQKnob({ label, color }: { label: string, color: string }) {
    return (
        <group>
            <Cylinder args={[0.03, 0.03, 0.04, 32]}>
                <meshStandardMaterial color="#333" metalness={0.5} />
            </Cylinder>
            {/* Indicator Top */}
            <Cylinder args={[0.025, 0.025, 0.041, 32]}>
                 <meshStandardMaterial color={color} />
            </Cylinder>
            <Text position={[0, -0.03, 0.05]} fontSize={0.015} rotation={[-Math.PI/2, 0, 0]} color="#888">{label}</Text>
        </group>
    )
}


