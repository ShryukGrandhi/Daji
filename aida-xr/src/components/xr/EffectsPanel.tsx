import React, { useState } from 'react'
import { Box, Cylinder, Text, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

interface EffectsPanelProps {
  side: 'left' | 'right'
}

export function EffectsPanel({ side }: EffectsPanelProps) {
  const [reverbOn, setReverbOn] = useState(false)
  const [delayOn, setDelayOn] = useState(false)
  const [flangerOn, setFlangerOn] = useState(false)
  const [echoOn, setEchoOn] = useState(false)
  const [filterSweep, setFilterSweep] = useState(0.5)
  const [dryWet, setDryWet] = useState(0.3)
  
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)

  const handleEffectToggle = (effect: string, isOn: boolean) => {
    setCoachMessage(`${effect} ${isOn ? 'ON' : 'OFF'}`)
  }

  const panelColor = side === 'left' ? "#ef4444" : "#3b82f6"
  const deckLabel = side === 'left' ? "DECK A FX" : "DECK B FX"

  return (
    <group>
      {/* Panel Background */}
      <RoundedBox args={[0.3, 0.05, 0.6]} radius={0.02} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.5} />
      </RoundedBox>

      {/* Panel Header */}
      <Text 
        position={[0, 0.026, -0.25]} 
        fontSize={0.025} 
        rotation={[-Math.PI/2, 0, 0]} 
        color={panelColor}
        fontWeight="bold"
      >
        {deckLabel}
      </Text>

      {/* REVERB Button */}
      <group position={[-0.08, 0.026, -0.15]} onClick={() => {
        setReverbOn(!reverbOn)
        handleEffectToggle('Reverb', !reverbOn)
      }}>
        <EffectButton label="REVERB" isOn={reverbOn} color="#8b5cf6" />
      </group>

      {/* DELAY Button */}
      <group position={[0.08, 0.026, -0.15]} onClick={() => {
        setDelayOn(!delayOn)
        handleEffectToggle('Delay', !delayOn)
      }}>
        <EffectButton label="DELAY" isOn={delayOn} color="#06b6d4" />
      </group>

      {/* FLANGER Button */}
      <group position={[-0.08, 0.026, -0.05]} onClick={() => {
        setFlangerOn(!flangerOn)
        handleEffectToggle('Flanger', !flangerOn)
      }}>
        <EffectButton label="FLANGER" isOn={flangerOn} color="#f59e0b" />
      </group>

      {/* ECHO Button */}
      <group position={[0.08, 0.026, -0.05]} onClick={() => {
        setEchoOn(!echoOn)
        handleEffectToggle('Echo', !echoOn)
      }}>
        <EffectButton label="ECHO" isOn={echoOn} color="#10b981" />
      </group>

      {/* DRY/WET Knob */}
      <group position={[-0.08, 0.026, 0.08]}>
        <Text position={[0, 0, -0.04]} fontSize={0.012} rotation={[-Math.PI/2, 0, 0]} color="#888">DRY/WET</Text>
        <Cylinder args={[0.025, 0.025, 0.02, 32]}>
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.3} />
        </Cylinder>
        <Box args={[0.003, 0.021, 0.018]} position={[0, 0, 0.012]} rotation={[0, (dryWet - 0.5) * Math.PI, 0]}>
          <meshStandardMaterial color={panelColor} />
        </Box>
        {/* Click zones */}
        <group position={[-0.03, 0, 0]} onClick={() => setDryWet(Math.max(0, dryWet - 0.1))}>
          <Box args={[0.03, 0.03, 0.05]}><meshStandardMaterial transparent opacity={0} /></Box>
        </group>
        <group position={[0.03, 0, 0]} onClick={() => setDryWet(Math.min(1, dryWet + 0.1))}>
          <Box args={[0.03, 0.03, 0.05]}><meshStandardMaterial transparent opacity={0} /></Box>
        </group>
      </group>

      {/* FILTER SWEEP Knob */}
      <group position={[0.08, 0.026, 0.08]}>
        <Text position={[0, 0, -0.04]} fontSize={0.012} rotation={[-Math.PI/2, 0, 0]} color="#888">SWEEP</Text>
        <Cylinder args={[0.025, 0.025, 0.02, 32]}>
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.3} />
        </Cylinder>
        <Box args={[0.003, 0.021, 0.018]} position={[0, 0, 0.012]} rotation={[0, (filterSweep - 0.5) * Math.PI, 0]}>
          <meshStandardMaterial color={panelColor} />
        </Box>
        {/* Click zones */}
        <group position={[-0.03, 0, 0]} onClick={() => setFilterSweep(Math.max(0, filterSweep - 0.1))}>
          <Box args={[0.03, 0.03, 0.05]}><meshStandardMaterial transparent opacity={0} /></Box>
        </group>
        <group position={[0.03, 0, 0]} onClick={() => setFilterSweep(Math.min(1, filterSweep + 0.1))}>
          <Box args={[0.03, 0.03, 0.05]}><meshStandardMaterial transparent opacity={0} /></Box>
        </group>
      </group>

      {/* HOT CUE Pads */}
      <group position={[0, 0.026, 0.2]}>
        <Text position={[0, 0, -0.04]} fontSize={0.012} rotation={[-Math.PI/2, 0, 0]} color="#888">HOT CUES</Text>
        <group position={[-0.06, 0, 0]}>
          <HotCuePad number={1} color="#ef4444" />
        </group>
        <group position={[-0.02, 0, 0]}>
          <HotCuePad number={2} color="#f59e0b" />
        </group>
        <group position={[0.02, 0, 0]}>
          <HotCuePad number={3} color="#10b981" />
        </group>
        <group position={[0.06, 0, 0]}>
          <HotCuePad number={4} color="#3b82f6" />
        </group>
      </group>
    </group>
  )
}

function EffectButton({ label, isOn, color }: { label: string, isOn: boolean, color: string }) {
  return (
    <group>
      <RoundedBox args={[0.1, 0.02, 0.05]} radius={0.008}>
        <meshStandardMaterial 
          color={isOn ? color : "#222"} 
          emissive={isOn ? color : "#000"}
          emissiveIntensity={isOn ? 0.6 : 0}
        />
      </RoundedBox>
      <Text 
        position={[0, 0.011, 0]} 
        fontSize={0.012} 
        rotation={[-Math.PI/2, 0, 0]} 
        color={isOn ? "#000" : "#888"}
      >
        {label}
      </Text>
    </group>
  )
}

function HotCuePad({ number, color }: { number: number, color: string }) {
  const [isPressed, setIsPressed] = useState(false)
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)

  const handlePress = () => {
    setIsPressed(true)
    setCoachMessage(`Hot Cue ${number} triggered`)
    setTimeout(() => setIsPressed(false), 200)
  }

  return (
    <group onClick={handlePress}>
      <RoundedBox args={[0.035, 0.015, 0.035]} radius={0.005}>
        <meshStandardMaterial 
          color={isPressed ? color : "#333"} 
          emissive={isPressed ? color : "#000"}
          emissiveIntensity={isPressed ? 1 : 0}
        />
      </RoundedBox>
      <Text 
        position={[0, 0.008, 0]} 
        fontSize={0.015} 
        rotation={[-Math.PI/2, 0, 0]} 
        color={isPressed ? "#000" : "#666"}
      >
        {number}
      </Text>
    </group>
  )
}

