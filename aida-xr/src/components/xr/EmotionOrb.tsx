import React, { useState } from 'react'
import { Text, RoundedBox } from '@react-three/drei'
import { useDJStore, EmotionMode } from '@/store/useDJStore'

export function EmotionOrb() {
  const setEmotionMode = useDJStore((state) => state.setEmotionMode)
  const activeMode = useDJStore((state) => state.emotionMode)

  const modes: { mode: EmotionMode, label: string, color: string }[] = [
      { mode: 'neutral', label: 'CLEAN', color: '#666' },
      { mode: 'dreamy', label: 'DREAMY', color: '#8b5cf6' },
      { mode: 'hype', label: 'HYPE', color: '#facc15' },
      { mode: 'aggressive', label: 'HARD', color: '#ef4444' },
  ]

  return (
    <group>
      <Text position={[0, 0.08, 0]} fontSize={0.025} color="#888" rotation={[-Math.PI/2, 0, 0]}>
        VIBE
      </Text>
      
      {modes.map((m, i) => {
          const isActive = activeMode === m.mode
          return (
              <group key={m.mode} position={[(i - 1.5) * 0.12, 0, 0.05]} onClick={() => setEmotionMode(m.mode)}>
                  <RoundedBox args={[0.1, 0.03, 0.06]} radius={0.01}>
                      <meshStandardMaterial 
                        color={isActive ? m.color : "#222"} 
                        emissive={isActive ? m.color : "#000"}
                        emissiveIntensity={isActive ? 0.5 : 0}
                      />
                  </RoundedBox>
                  <Text position={[0, 0.016, 0]} fontSize={0.015} color={isActive ? "#fff" : "#666"} rotation={[-Math.PI/2, 0, 0]}>
                      {m.label}
                  </Text>
              </group>
          )
      })}
    </group>
  )
}
