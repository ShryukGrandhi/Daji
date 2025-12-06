import React, { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Box, Line } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface WaveformScrubberProps {
  deckId: 'A' | 'B'
  position: [number, number, number]
}

export function WaveformScrubber({ deckId, position }: WaveformScrubberProps) {
  const playing = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].playing)
  const bpm = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].bpm)
  const currentPosition = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].currentPosition)
  const updateDeck = useDJStore((state) => state.updateDeck)
  const setIsInteracting = useDJStore((state) => state.setIsInteracting)
  
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(1) // 1x, 2x, 4x zoom
  const waveformRef = useRef<THREE.Group>(null)
  const { raycaster } = useThree()
  
  const deckColor = deckId === 'A' ? "#ef4444" : "#3b82f6"
  const waveformWidth = 0.5
  const waveformHeight = 0.15
  const numSamples = 128 * zoom // More samples when zoomed
  
  // Generate waveform data (simulated - in real app would use audio analysis)
  const generateWaveform = () => {
    const samples: number[] = []
    for (let i = 0; i < numSamples; i++) {
      const pos = i / numSamples
      // Simulate waveform with beat-aligned peaks
      const beatPos = (pos * 100) % (60 / bpm) // Beat position
      const beatStrength = Math.sin(beatPos * Math.PI * 2) * 0.5 + 0.5
      const noise = Math.random() * 0.3
      samples.push(beatStrength * 0.7 + noise)
    }
    return samples
  }
  
  const waveformData = useRef(generateWaveform())
  
  // Update waveform when zoom changes
  React.useEffect(() => {
    waveformData.current = generateWaveform()
  }, [zoom, bpm])
  
  // Animate waveform when playing
  useFrame((state) => {
    if (playing && waveformRef.current) {
      // Scroll waveform based on current position
      const scrollOffset = -currentPosition * waveformWidth * zoom
      waveformRef.current.position.x = scrollOffset
    }
  })
  
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
    if (!isDragging || !waveformRef.current) return
    e.stopPropagation()
    
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)
    
    const localX = waveformRef.current.parent!.worldToLocal(intersection.clone()).x
    const newPosition = Math.max(0, Math.min(1, (localX + waveformWidth * zoom / 2) / (waveformWidth * zoom)))
    updateDeck(deckId, { currentPosition: newPosition, startPosition: newPosition })
  }
  
  // Calculate beat grid positions
  const beatsPerBar = 4
  const barsVisible = zoom
  const totalBeats = barsVisible * beatsPerBar
  const beatSpacing = waveformWidth / totalBeats
  
  return (
    <group position={position}>
      {/* Background */}
      <Box args={[waveformWidth, waveformHeight, 0.01]}>
        <meshStandardMaterial color="#0a0a0a" />
      </Box>
      
      {/* Waveform Container */}
      <group 
        ref={waveformRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        {/* Beat Grid Lines */}
        {Array.from({ length: totalBeats + 1 }).map((_, i) => {
          const isBar = i % beatsPerBar === 0
          const x = (i / totalBeats) * waveformWidth - waveformWidth / 2
          return (
            <Line
              key={i}
              points={[[x, -waveformHeight/2, 0.001], [x, waveformHeight/2, 0.001]]}
              color={isBar ? "#fff" : "#444"}
              lineWidth={isBar ? 2 : 1}
            />
          )
        })}
        
        {/* Waveform Bars */}
        {waveformData.current.map((amplitude, i) => {
          const x = (i / numSamples) * waveformWidth - waveformWidth / 2
          const height = amplitude * waveformHeight * 0.8
          const isPositive = i % 2 === 0
          
          return (
            <Box
              key={i}
              args={[waveformWidth / numSamples, height, 0.002]}
              position={[x, isPositive ? height/2 : -height/2, 0.002]}
            >
              <meshStandardMaterial
                color={deckColor}
                emissive={deckColor}
                emissiveIntensity={0.4}
                transparent
                opacity={0.7}
              />
            </Box>
          )
        })}
        
        {/* Playhead Indicator */}
        <Line
          points={[
            [currentPosition * waveformWidth - waveformWidth/2, -waveformHeight/2, 0.003],
            [currentPosition * waveformWidth - waveformWidth/2, waveformHeight/2, 0.003]
          ]}
          color="#fff"
          lineWidth={3}
        />
        
        {/* Click-to-cue indicator */}
        {isDragging && (
          <Text
            position={[0, waveformHeight/2 + 0.02, 0.004]}
            fontSize={0.02}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            CUE: {Math.round(currentPosition * 100)}%
          </Text>
        )}
      </group>
      
      {/* Zoom Controls */}
      <group position={[waveformWidth/2 + 0.05, 0, 0]}>
        <Text
          position={[0, waveformHeight/2, 0]}
          fontSize={0.015}
          color="#888"
          anchorX="center"
        >
          ZOOM
        </Text>
        {[1, 2, 4].map((level) => (
          <group
            key={level}
            position={[0, waveformHeight/2 - level * 0.03, 0]}
            onClick={(e) => {
              e.stopPropagation()
              setZoom(level)
            }}
          >
            <Box args={[0.03, 0.02, 0.01]}>
              <meshStandardMaterial
                color={zoom === level ? deckColor : "#333"}
                emissive={zoom === level ? deckColor : "#000"}
                emissiveIntensity={zoom === level ? 0.5 : 0}
              />
            </Box>
            <Text
              position={[0, 0, 0.006]}
              fontSize={0.012}
              color={zoom === level ? "#000" : "#666"}
              anchorX="center"
              anchorY="middle"
            >
              {level}x
            </Text>
          </group>
        ))}
      </group>
      
      {/* Position Label */}
      <Text
        position={[0, -waveformHeight/2 - 0.02, 0]}
        fontSize={0.015}
        color="#888"
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(currentPosition * 100)}% • {zoom}x zoom
      </Text>
    </group>
  )
}

