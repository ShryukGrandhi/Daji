import React, { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Cylinder, Box, Ring, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import { HotCuePads } from './HotCuePads'
import { BeatSyncIndicator } from './BeatSyncIndicator'
import * as THREE from 'three'

interface DeckProps {
  id: 'A' | 'B'
  label: string
}

// Horizontal Volume Slider Component (flat on the board)
function VolumeSlider({ volume, onChange, color }: { volume: number, onChange: (v: number) => void, color: string }) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<THREE.Group>(null)
  const { raycaster } = useThree()
  const setIsInteracting = useDJStore((state) => state.setIsInteracting)
  
  const sliderWidth = 0.25
  const knobX = (volume - 0.5) * sliderWidth // Map 0-1 to slider range
  
  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    setIsDragging(true)
    setIsInteracting(true)
    e.target.setPointerCapture(e.pointerId)
  }
  
  const handlePointerUp = (e: any) => {
    e.stopPropagation()
    setIsDragging(false)
    setIsInteracting(false)
    e.target.releasePointerCapture(e.pointerId)
  }
  
  const handlePointerMove = (e: any) => {
    if (!isDragging || !sliderRef.current) return
    e.stopPropagation()
    
    // Get intersection point on a horizontal plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)
    
    // Convert to local X and map to volume
    const localX = sliderRef.current.worldToLocal(intersection.clone()).x
    const newVolume = Math.max(0, Math.min(1, (localX / sliderWidth) + 0.5))
    onChange(newVolume)
  }

  return (
    <group ref={sliderRef}>
      {/* Slider Track (horizontal, flat on the board) */}
      <RoundedBox args={[sliderWidth, 0.015, 0.03]} radius={0.005}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Fill (from left to current volume) */}
      <RoundedBox 
        args={[sliderWidth * volume, 0.016, 0.025]} 
        radius={0.003}
        position={[-sliderWidth/2 + (sliderWidth * volume)/2, 0.001, 0]}
      >
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </RoundedBox>
      
      {/* Knob */}
      <group 
        position={[knobX, 0.01, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <RoundedBox args={[0.025, 0.02, 0.04]} radius={0.005}>
          <meshStandardMaterial 
            color={isDragging ? "#fff" : "#666"} 
            emissive={isDragging ? color : "#000"}
            emissiveIntensity={isDragging ? 0.5 : 0}
          />
        </RoundedBox>
      </group>
      
      {/* Volume Label (on left) */}
      <Text
        position={[-sliderWidth/2 - 0.03, 0.008, 0]}
        fontSize={0.018}
        color="#888"
        anchorX="right"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        VOL
      </Text>
      
      {/* Volume Value (on right) */}
      <Text
        position={[sliderWidth/2 + 0.03, 0.008, 0]}
        fontSize={0.02}
        color={color}
        anchorX="left"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        {Math.round(volume * 100)}
      </Text>
    </group>
  )
}

export function Deck({ id, label }: DeckProps) {
  const playing = useDJStore((state) => id === 'A' ? state.deckA.playing : state.deckB.playing)
  const loading = useDJStore((state) => id === 'A' ? state.deckA.loading : state.deckB.loading)
  const track = useDJStore((state) => id === 'A' ? state.deckA.track : state.deckB.track)
  const bpm = useDJStore((state) => id === 'A' ? state.deckA.bpm : state.deckB.bpm)
  const loop = useDJStore((state) => id === 'A' ? state.deckA.loop : state.deckB.loop)
  const loopLength = useDJStore((state) => id === 'A' ? state.deckA.loopLength : state.deckB.loopLength)
  const loopIn = useDJStore((state) => id === 'A' ? state.deckA.loopIn : state.deckB.loopIn)
  const loopOut = useDJStore((state) => id === 'A' ? state.deckA.loopOut : state.deckB.loopOut)
  const currentPosition = useDJStore((state) => id === 'A' ? state.deckA.currentPosition : state.deckB.currentPosition)
  const volume = useDJStore((state) => id === 'A' ? state.deckA.volume : state.deckB.volume)
  const updateDeck = useDJStore((state) => state.updateDeck)
  const setLoopIn = useDJStore((state) => state.setLoopIn)
  const setLoopOut = useDJStore((state) => state.setLoopOut)
  const setAutoLoop = useDJStore((state) => state.setAutoLoop)
  const clearLoop = useDJStore((state) => state.clearLoop)
  
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

  const togglePlay = (e: any) => {
    e.stopPropagation()
    updateDeck(id, { playing: !playing })
  }
  const toggleLoop = (e: any) => {
    e.stopPropagation()
    if (loop) {
      clearLoop(id)
    } else {
      updateDeck(id, { loop: true })
    }
  }
  const handleSetLoopIn = (e: any) => {
    e.stopPropagation()
    setLoopIn(id, currentPosition)
  }
  const handleSetLoopOut = (e: any) => {
    e.stopPropagation()
    setLoopOut(id, currentPosition)
  }
  const handleAutoLoop = (beats: number, e: any) => {
    e.stopPropagation()
    setAutoLoop(id, beats)
  }
  const handleCue = (e: any) => {
    e.stopPropagation()
    setCueActive(true)
    setTimeout(() => setCueActive(false), 200)
  }
  const handleSync = (e: any) => {
    e.stopPropagation()
    setSyncActive(true)
    // Sync BPM to the other deck
    const otherDeckBpm = useDJStore.getState()[id === 'A' ? 'deckB' : 'deckA'].bpm
    updateDeck(id, { bpm: otherDeckBpm })
    setTimeout(() => setSyncActive(false), 500)
  }
  const adjustBpm = (delta: number, e?: any) => {
    e?.stopPropagation()
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
          {loading ? "LOADING..." : (track || "No Track Loaded")}
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
        <group position={[-0.12, 0, 0]} onClick={(e) => adjustBpm(-1, e)}>
          <Box args={[0.04, 0.02, 0.04]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <Text position={[0, 0.011, 0]} fontSize={0.025} color="#fff" rotation={[-Math.PI/2,0,0]}>-</Text>
        </group>
        <group position={[0.12, 0, 0]} onClick={(e) => adjustBpm(1, e)}>
          <Box args={[0.04, 0.02, 0.04]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <Text position={[0, 0.011, 0]} fontSize={0.025} color="#fff" rotation={[-Math.PI/2,0,0]}>+</Text>
        </group>
      </group>

      {/* Turntable Platter - Make it more visible */}
      <group position={[0, 0.03, 0]}>
        {/* Outer ring - brighter */}
        <Cylinder args={[0.28, 0.30, 0.015, 64]}>
          <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.8} />
        </Cylinder>
        
        {/* Spinning platter - more visible */}
        <group ref={platterRef}>
          <Cylinder args={[0.26, 0.26, 0.02, 64]}>
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
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
        <group position={[-0.15, 0, 0]} onClick={loading ? undefined : togglePlay}>
          <RoundedBox args={[0.08, 0.025, 0.08]} radius={0.01}>
            <meshStandardMaterial 
              color={loading ? "#f59e0b" : (playing ? "#10b981" : "#222")} 
              emissive={loading ? "#f59e0b" : (playing ? "#10b981" : "#000")}
              emissiveIntensity={playing || loading ? 0.8 : 0}
            />
          </RoundedBox>
          <Text position={[0, 0.013, 0]} fontSize={0.035} color={(playing || loading) ? "#000" : "#fff"} rotation={[-Math.PI/2,0,0]}>
            {loading ? "⏳" : (playing ? "▌▌" : "▶")}
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

      {/* Advanced Loop Controls */}
      <group position={[0, 0.02, -0.35]}>
        <Text
          position={[0, 0.03, 0]}
          fontSize={0.018}
          color="#888"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI/2, 0, 0]}
        >
          LOOP CONTROLS
        </Text>
        
        {/* Auto-Loop Buttons (1, 2, 4, 8, 16 beats) */}
        <group position={[0, 0.02, 0]}>
          {[1, 2, 4, 8, 16].map((beats, i) => (
            <group
              key={beats}
              position={[(i - 2) * 0.05, 0, 0]}
              onClick={(e) => handleAutoLoop(beats, e)}
            >
              <RoundedBox args={[0.04, 0.015, 0.04]} radius={0.005}>
                <meshStandardMaterial
                  color={loopLength === beats ? deckColor : "#222"}
                  emissive={loopLength === beats ? deckColor : "#000"}
                  emissiveIntensity={loopLength === beats ? 0.6 : 0}
                />
              </RoundedBox>
              <Text
                position={[0, 0.008, 0]}
                fontSize={0.015}
                color={loopLength === beats ? "#000" : "#666"}
                rotation={[-Math.PI/2, 0, 0]}
              >
                {beats}
              </Text>
            </group>
          ))}
        </group>
        
        {/* Manual Loop In/Out */}
        <group position={[0, 0.02, -0.08]}>
          <group position={[-0.06, 0, 0]} onClick={handleSetLoopIn}>
            <RoundedBox args={[0.05, 0.015, 0.04]} radius={0.005}>
              <meshStandardMaterial
                color={loopIn !== null ? "#10b981" : "#222"}
                emissive={loopIn !== null ? "#10b981" : "#000"}
                emissiveIntensity={loopIn !== null ? 0.6 : 0}
              />
            </RoundedBox>
            <Text
              position={[0, 0.008, 0]}
              fontSize={0.012}
              color={loopIn !== null ? "#000" : "#666"}
              rotation={[-Math.PI/2, 0, 0]}
            >
              IN
            </Text>
          </group>
          
          <group position={[0.06, 0, 0]} onClick={handleSetLoopOut}>
            <RoundedBox args={[0.05, 0.015, 0.04]} radius={0.005}>
              <meshStandardMaterial
                color={loopOut !== null ? "#ef4444" : "#222"}
                emissive={loopOut !== null ? "#ef4444" : "#000"}
                emissiveIntensity={loopOut !== null ? 0.6 : 0}
              />
            </RoundedBox>
            <Text
              position={[0, 0.008, 0]}
              fontSize={0.012}
              color={loopOut !== null ? "#000" : "#666"}
              rotation={[-Math.PI/2, 0, 0]}
            >
              OUT
            </Text>
          </group>
        </group>
        
        {/* Loop Status Display */}
        {loop && (
          <Text
            position={[0, 0.02, -0.13]}
            fontSize={0.012}
            color={deckColor}
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI/2, 0, 0]}
          >
            {loopLength ? `${loopLength} beats` : loopIn !== null && loopOut !== null 
              ? `Manual: ${Math.round((loopOut - loopIn) * 100)}%` 
              : 'Loop Active'}
          </Text>
        )}
      </group>

      {/* Jog Wheel Touch Zones (left/right for nudging) */}
      <group position={[-0.35, 0.02, 0]} onClick={(e) => adjustBpm(-0.5, e)}>
        <Box args={[0.06, 0.02, 0.15]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
        <Text position={[0, 0.011, 0]} fontSize={0.02} color="#444" rotation={[-Math.PI/2,0,0]}>◀</Text>
      </group>
      <group position={[0.35, 0.02, 0]} onClick={(e) => adjustBpm(0.5, e)}>
        <Box args={[0.06, 0.02, 0.15]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
        <Text position={[0, 0.011, 0]} fontSize={0.02} color="#444" rotation={[-Math.PI/2,0,0]}>▶</Text>
      </group>

      {/* Volume Slider - horizontal, on the board surface */}
      <group position={[0, 0.02, 0.46]}>
        <VolumeSlider 
          volume={volume} 
          onChange={(v) => updateDeck(id, { volume: v })}
          color={deckColor}
        />
      </group>

      {/* Hot Cue Pads - positioned below the turntable */}
      <group position={[0, 0.02, -0.45]}>
        <HotCuePads deckId={id} />
      </group>

      {/* Beat Sync Indicator - top right of deck */}
      <group position={[0.3, 0.15, 0.1]}>
        <BeatSyncIndicator deckId={id} position={[0, 0, 0]} />
      </group>
    </group>
  )
}
