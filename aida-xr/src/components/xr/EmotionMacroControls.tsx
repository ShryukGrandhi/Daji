import React, { useState } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

export function EmotionMacroControls() {
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)
  const updateDeck = useDJStore((state) => state.updateDeck)
  
  const [activeMood, setActiveMood] = useState<string | null>(null)

  const handleMood = (mood: string, color: string) => {
    setActiveMood(mood)
    setCoachMessage(`Setting Vibe: ${mood.toUpperCase()}`)
    
    // Simple preset logic
    if (mood === 'euphoric') {
        updateDeck('A', { filter: 0.8, reverb: 0.4 })
        updateDeck('B', { filter: 0.8, reverb: 0.4 })
    } else if (mood === 'dark') {
        updateDeck('A', { filter: 0.3, distortion: 0.2 })
        updateDeck('B', { filter: 0.3, distortion: 0.2 })
    } else if (mood === 'energy') {
        updateDeck('A', { filter: 1, delay: 0.3 })
        updateDeck('B', { filter: 1, delay: 0.3 })
    }

    setTimeout(() => setActiveMood(null), 500)
  }

  return (
    <group>
      {/* Label */}
      <Text position={[0, 0.04, 0]} fontSize={0.03} rotation={[-Math.PI/2, 0, 0]} color="#aaa">
        VIBE MACROS
      </Text>

      {/* Euphoric Button */}
      <group position={[-0.12, 0, 0.05]} onClick={() => handleMood('euphoric', '#a855f7')}>
        <RoundedBox args={[0.1, 0.02, 0.06]} radius={0.01}>
          <meshStandardMaterial 
            color={activeMood === 'euphoric' ? "#a855f7" : "#222"} 
            emissive={activeMood === 'euphoric' ? "#a855f7" : "#000"}
            emissiveIntensity={0.5}
          />
        </RoundedBox>
        <Text position={[0, 0.011, 0]} fontSize={0.015} rotation={[-Math.PI/2, 0, 0]} color="white">
          EUPHORIC
        </Text>
      </group>

      {/* Dark Button */}
      <group position={[0, 0, 0.05]} onClick={() => handleMood('dark', '#ef4444')}>
        <RoundedBox args={[0.1, 0.02, 0.06]} radius={0.01}>
          <meshStandardMaterial 
            color={activeMood === 'dark' ? "#ef4444" : "#222"} 
            emissive={activeMood === 'dark' ? "#ef4444" : "#000"}
            emissiveIntensity={0.5}
          />
        </RoundedBox>
        <Text position={[0, 0.011, 0]} fontSize={0.015} rotation={[-Math.PI/2, 0, 0]} color="white">
          DARK
        </Text>
      </group>

      {/* Energy Button */}
      <group position={[0.12, 0, 0.05]} onClick={() => handleMood('energy', '#eab308')}>
        <RoundedBox args={[0.1, 0.02, 0.06]} radius={0.01}>
          <meshStandardMaterial 
            color={activeMood === 'energy' ? "#eab308" : "#222"} 
            emissive={activeMood === 'energy' ? "#eab308" : "#000"}
            emissiveIntensity={0.5}
          />
        </RoundedBox>
        <Text position={[0, 0.011, 0]} fontSize={0.015} rotation={[-Math.PI/2, 0, 0]} color="white">
          ENERGY
        </Text>
      </group>
    </group>
  )
}


