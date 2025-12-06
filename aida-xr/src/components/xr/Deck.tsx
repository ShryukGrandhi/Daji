import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Cylinder, Box, Ring, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface DeckProps {
  id: 'A' | 'B'
  label: string
}

export function Deck({ id, label }: DeckProps) {
  const playing = useDJStore((state) => id === 'A' ? state.deckA.playing : state.deckB.playing)
  const track = useDJStore((state) => id === 'A' ? state.deckA.track : state.deckB.track)
  const bpm = useDJStore((state) => id === 'A' ? state.deckA.bpm : state.deckB.bpm)
  const loop = useDJStore((state) => id === 'A' ? state.deckA.loop : state.deckB.loop)
  const volume = useDJStore((state) => id === 'A' ? state.deckA.volume : state.deckB.volume)
  const updateDeck = useDJStore((state) => state.updateDeck)
  
  const platterRef = useRef<THREE.Group>(null)
  const [cueActive, setCueActive] = useState(false)
  const [syncActive, setSyncActive] = useState(false)

  const deckColor = id === 'A' ? "#ef4444" : "#3b82f6"
  const deckColorDim = id === 'A' ? "#7f1d1d" : "#1e3a8a"

  useFrame((state, delta) => {
    if (playing && platterRef.current) {
      platterRef.current.rotation.y -= delta * (bpm / 60) * 2 
    }
  })

  const togglePlay = () => updateDeck(id, { playing: !playing })
  const toggleLoop = () => updateDeck(id, { loop: !loop })
  const handleCue = () => {
    setCueActive(true)
    setTimeout(() => setCueActive(false), 200)
  }
  const handleSync = () => {
    setSyncActive(true)
    // Sync BPM to the other deck
    const otherDeckBpm = useDJStore.getState()[id === 'A' ? 'deckB' : 'deckA'].bpm
    updateDeck(id, { bpm: otherDeckBpm })
    setTimeout(() => setSyncActive(false), 500)
  }
  const adjustBpm = (delta: number) => {
    updateDeck(id, { bpm: Math.max(60, Math.min(180, bpm + delta)) })
  }

  return (
    <group>
      {/* Deck Label */}
      <Text
        position={[0, 0.01, -0.32]}
        fontSize={0.06}
        color={deckColor}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
        fontWeight="bold"
      >
        {label}
      </Text>

      {/* Track Info Display */}
      <group position={[0, 0.02, -0.22]}>
        <RoundedBox args={[0.5, 0.01, 0.08]} radius={0.005}>
          <meshStandardMaterial color="#000" emissive={playing ? deckColor : "#111"} emissiveIntensity={0.3} />
        </RoundedBox>
        <Text
          position={[0, 0.006, 0]}
          fontSize={0.025}
          color={playing ? "#fff" : "#666"}
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
          maxWidth={0.45}
        >
          {track || "No Track Loaded"}
        </Text>
      </group>

      {/* BPM Display */}
      <group position={[0, 0.02, 0.32]}>
        <RoundedBox args={[0.2, 0.01, 0.06]} radius={0.005}>
          <meshStandardMaterial color="#111" />
        </RoundedBox>
        <Text
          position={[0, 0.006, 0]}
          fontSize={0.03}
          color={deckColor}
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
          fontWeight="bold"
        >
          {bpm} BPM
        </Text>
        {/* BPM +/- buttons */}
        <group position={[-0.12, 0, 0]} onClick={() => adjustBpm(-1)}>
          <Box args={[0.04, 0.02, 0.04]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <Text position={[0, 0.011, 0]} fontSize={0.025} color="#fff" rotation={[-Math.PI/2,0,0]}>-</Text>
        </group>
        <group position={[0.12, 0, 0]} onClick={() => adjustBpm(1)}>
          <Box args={[0.04, 0.02, 0.04]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <Text position={[0, 0.011, 0]} fontSize={0.025} color="#fff" rotation={[-Math.PI/2,0,0]}>+</Text>
        </group>
      </group>

      {/* Turntable Platter */}
      <group position={[0, 0.02, 0]}>
        {/* Outer ring */}
        <Cylinder args={[0.28, 0.30, 0.015, 64]}>
          <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
        </Cylinder>
        
        {/* Spinning platter */}
        <group ref={platterRef}>
          <Cylinder args={[0.26, 0.26, 0.02, 64]}>
            <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.2} />
          </Cylinder>
          {/* Vinyl grooves */}
          <Ring args={[0.08, 0.25, 64]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.011, 0]}>
            <meshStandardMaterial color="#151515" roughness={0.9} />
          </Ring>
          {/* Center label - shows deck color when playing */}
          <Cylinder args={[0.07, 0.07, 0.021, 32]}>
            <meshStandardMaterial 
              color={playing ? deckColor : "#222"} 
              emissive={playing ? deckColor : "#000"}
              emissiveIntensity={playing ? 0.5 : 0}
            />
          </Cylinder>
          {/* Deck indicator on label */}
          <Text
            position={[0, 0.022, 0]}
            fontSize={0.04}
            color="#fff"
            rotation={[-Math.PI / 2, 0, 0]}
            anchorX="center"
            anchorY="middle"
          >
            {id}
          </Text>
          {/* Position marker */}
          <Box args={[0.015, 0.025, 0.08]} position={[0.18, 0.015, 0]}>
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={playing ? 0.5 : 0} />
          </Box>
        </group>
      </group>

      {/* Control Buttons Row */}
      <group position={[0, 0.02, 0.38]}>
        {/* PLAY/PAUSE Button */}
        <group position={[-0.15, 0, 0]} onClick={togglePlay}>
          <RoundedBox args={[0.08, 0.025, 0.08]} radius={0.01}>
            <meshStandardMaterial 
              color={playing ? "#10b981" : "#222"} 
              emissive={playing ? "#10b981" : "#000"}
              emissiveIntensity={playing ? 0.8 : 0}
            />
          </RoundedBox>
          <Text position={[0, 0.013, 0]} fontSize={0.035} color={playing ? "#000" : "#fff"} rotation={[-Math.PI/2,0,0]}>
            {playing ? "▌▌" : "▶"}
          </Text>
        </group>

        {/* CUE Button */}
        <group position={[-0.05, 0, 0]} onClick={handleCue}>
          <RoundedBox args={[0.08, 0.025, 0.08]} radius={0.01}>
            <meshStandardMaterial 
              color={cueActive ? "#f59e0b" : "#222"} 
              emissive={cueActive ? "#f59e0b" : "#000"}
              emissiveIntensity={cueActive ? 0.8 : 0}
            />
          </RoundedBox>
          <Text position={[0, 0.013, 0]} fontSize={0.02} color="#fff" rotation={[-Math.PI/2,0,0]}>CUE</Text>
        </group>

        {/* SYNC Button */}
        <group position={[0.05, 0, 0]} onClick={handleSync}>
          <RoundedBox args={[0.08, 0.025, 0.08]} radius={0.01}>
            <meshStandardMaterial 
              color={syncActive ? "#8b5cf6" : "#222"} 
              emissive={syncActive ? "#8b5cf6" : "#000"}
              emissiveIntensity={syncActive ? 0.8 : 0}
            />
          </RoundedBox>
          <Text position={[0, 0.013, 0]} fontSize={0.02} color="#fff" rotation={[-Math.PI/2,0,0]}>SYNC</Text>
        </group>

        {/* LOOP Button */}
        <group position={[0.15, 0, 0]} onClick={toggleLoop}>
          <RoundedBox args={[0.08, 0.025, 0.08]} radius={0.01}>
            <meshStandardMaterial 
              color={loop ? "#06b6d4" : "#222"} 
              emissive={loop ? "#06b6d4" : "#000"}
              emissiveIntensity={loop ? 0.8 : 0}
            />
          </RoundedBox>
          <Text position={[0, 0.013, 0]} fontSize={0.02} color="#fff" rotation={[-Math.PI/2,0,0]}>LOOP</Text>
        </group>
      </group>

      {/* Jog Wheel Touch Zones (left/right for nudging) */}
      <group position={[-0.35, 0.02, 0]} onClick={() => adjustBpm(-0.5)}>
        <Box args={[0.06, 0.02, 0.15]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
        <Text position={[0, 0.011, 0]} fontSize={0.02} color="#444" rotation={[-Math.PI/2,0,0]}>◀</Text>
      </group>
      <group position={[0.35, 0.02, 0]} onClick={() => adjustBpm(0.5)}>
        <Box args={[0.06, 0.02, 0.15]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
        <Text position={[0, 0.011, 0]} fontSize={0.02} color="#444" rotation={[-Math.PI/2,0,0]}>▶</Text>
      </group>
    </group>
  )
}
