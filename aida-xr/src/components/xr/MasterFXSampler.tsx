import React, { useState } from 'react'
import { Text, RoundedBox, Box } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface SamplerPadProps {
  label: string
  sound: string
  color: string
  position: [number, number, number]
  onTrigger: () => void
}

function SamplerPad({ label, sound, color, position, onTrigger }: SamplerPadProps) {
  const [isPressed, setIsPressed] = useState(false)
  
  const handleClick = (e: any) => {
    e.stopPropagation()
    setIsPressed(true)
    onTrigger()
    setTimeout(() => setIsPressed(false), 150)
  }
  
  return (
    <group position={position} onClick={handleClick}>
      <RoundedBox args={[0.08, 0.02, 0.08]} radius={0.005}>
        <meshStandardMaterial
          color={isPressed ? color : "#1a1a1a"}
          emissive={isPressed ? color : "#000"}
          emissiveIntensity={isPressed ? 1 : 0.2}
        />
      </RoundedBox>
      <Text
        position={[0, 0.011, 0]}
        fontSize={0.015}
        color={isPressed ? "#000" : "#fff"}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  )
}

export function MasterFXSampler() {
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)
  const masterVolume = useDJStore((state) => state.masterVolume)
  const setMasterVolume = useDJStore((state) => state.setMasterVolume)
  
  const triggerSound = (sound: string) => {
    setCoachMessage(`🎵 ${sound} triggered!`)
    // In a real implementation, this would play an audio file
    // For now, we'll just show feedback
  }
  
  return (
    <group>
      {/* Panel Background */}
      <RoundedBox args={[0.9, 0.06, 0.1]} radius={0.01}>
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      
      {/* Header */}
      <Text
        position={[0, 0.045, 0]}
        fontSize={0.025}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
        fontWeight="bold"
      >
        MASTER FX & SAMPLER
      </Text>
      
      {/* Sampler Pads */}
      <group position={[0, 0.04, 0]}>
        <SamplerPad
          label="AIRHORN"
          sound="airhorn"
          color="#fbbf24"
          position={[-0.4, 0, 0]}
          onTrigger={() => triggerSound("Airhorn")}
        />
        <SamplerPad
          label="KICK"
          sound="kick"
          color="#ef4444"
          position={[-0.2, 0, 0]}
          onTrigger={() => triggerSound("Kick")}
        />
        <SamplerPad
          label="SNARE"
          sound="snare"
          color="#3b82f6"
          position={[0, 0, 0]}
          onTrigger={() => triggerSound("Snare")}
        />
        <SamplerPad
          label="RISER"
          sound="riser"
          color="#8b5cf6"
          position={[0.2, 0, 0]}
          onTrigger={() => triggerSound("Riser")}
        />
        <SamplerPad
          label="CRASH"
          sound="crash"
          color="#10b981"
          position={[0.4, 0, 0]}
          onTrigger={() => triggerSound("Crash")}
        />
      </group>
      
      {/* Master Volume Display */}
      <group position={[0, 0.04, -0.05]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.015}
          color="#888"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI/2, 0, 0]}
        >
          MASTER: {Math.round(masterVolume * 100)}%
        </Text>
      </group>
    </group>
  )
}

