import React, { useState } from 'react'
import { Sphere, Text } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import { useFrame } from '@react-three/fiber'

interface StemsOrbsProps {
  deckId: 'A' | 'B'
}

export function StemsOrbs({ deckId }: StemsOrbsProps) {
  const updateDeck = useDJStore((state) => state.updateDeck)
  const stemMode = useDJStore((state) => state.stemMode)
  
  const eq = useDJStore((state) => deckId === 'A' ? state.deckA.eq : state.deckB.eq)
  
  // Helper for Orb
  const Orb = ({ type, value, color, label, position }: { type: 'low' | 'mid' | 'high', value: number, color: string, label: string, position: [number, number, number] }) => {
    const [hovered, setHovered] = useState(false)
    
    const handleClick = () => {
        if (!stemMode) return // Only interactive in stem mode
        
        // Toggle: if value > 0.1, set to 0. Else set to 0.5
        const newValue = value > 0.1 ? 0 : 0.5
        updateDeck(deckId, { eq: { ...eq, [type]: newValue } })
    }

    return (
      <group position={position}>
        <Sphere 
            args={[0.03, 32, 32]} 
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            scale={value * 1.5 + 0.5} // Pulse with value
        >
            <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={value} 
                transparent 
                opacity={value < 0.1 ? 0.2 : 0.8}
                wireframe={value < 0.1}
            />
        </Sphere>
        <Text position={[0, 0.06, 0]} fontSize={0.02} color="white" anchorX="center">
            {label}
        </Text>
      </group>
    )
  }

  return (
    <group>
        {/* Bass / Low */}
        <Orb type="low" value={eq.low} color="#ef4444" label={stemMode ? "BASS" : "LO"} position={[-0.1, 0, 0]} />
        
        {/* Vocals / Mid */}
        <Orb type="mid" value={eq.mid} color="#22c55e" label={stemMode ? "VOCAL" : "MID"} position={[0, 0.05, 0]} />
        
        {/* Drums / High */}
        <Orb type="high" value={eq.high} color="#3b82f6" label={stemMode ? "DRUM" : "HI"} position={[0.1, 0, 0]} />
    </group>
  )
}

