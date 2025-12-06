import React from 'react'
import { Box, Text, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'
import * as THREE from 'three'

interface HotCuePadProps {
  deckId: 'A' | 'B'
  cueId: number
  position: [number, number, number]
}

function HotCuePad({ deckId, cueId, position }: HotCuePadProps) {
  const hotCues = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].hotCues)
  const setHotCue = useDJStore((state) => state.setHotCue)
  const clearHotCue = useDJStore((state) => state.clearHotCue)
  const jumpToHotCue = useDJStore((state) => state.jumpToHotCue)
  const currentPosition = useDJStore((state) => state[deckId === 'A' ? 'deckA' : 'deckB'].currentPosition)
  const setIsInteracting = useDJStore((state) => state.setIsInteracting)
  
  const cue = hotCues.find(c => c.id === cueId)
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
  const color = cue?.color || colors[cueId - 1]
  const isSet = !!cue
  
  const handleClick = (e: any) => {
    e.stopPropagation()
    setIsInteracting(true)
    
    if (e.shiftKey || e.button === 2) {
      // Shift+Click or Right-click: Clear cue
      clearHotCue(deckId, cueId)
    } else if (isSet) {
      // Click existing cue: Jump to it
      jumpToHotCue(deckId, cueId)
    } else {
      // Click empty pad: Set cue at current position
      setHotCue(deckId, cueId, currentPosition)
    }
    
    setTimeout(() => setIsInteracting(false), 100)
  }

  return (
    <group position={position} onClick={handleClick} onContextMenu={handleClick}>
      <RoundedBox args={[0.06, 0.02, 0.06]} radius={0.005}>
        <meshStandardMaterial
          color={isSet ? color : "#1a1a1a"}
          emissive={isSet ? color : "#000"}
          emissiveIntensity={isSet ? 0.6 : 0.2}
        />
      </RoundedBox>
      <Text
        position={[0, 0.011, 0]}
        fontSize={0.025}
        color={isSet ? "#000" : "#666"}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
        fontWeight="bold"
      >
        {cueId}
      </Text>
      {isSet && (
        <Text
          position={[0, 0.011, -0.02]}
          fontSize={0.015}
          color="#000"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI/2, 0, 0]}
        >
          {Math.round(cue.position * 100)}%
        </Text>
      )}
    </group>
  )
}

export function HotCuePads({ deckId }: { deckId: 'A' | 'B' }) {
  const deckColor = deckId === 'A' ? "#ef4444" : "#3b82f6"
  
  return (
    <group>
      <Text
        position={[0, 0.03, 0]}
        fontSize={0.02}
        color="#888"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        HOT CUES
      </Text>
      
      {/* 8 Hot Cue Pads in a 2x4 grid */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((cueId, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        const x = (col - 1.5) * 0.08
        const z = row * 0.08 - 0.04
        
        return (
          <HotCuePad
            key={cueId}
            deckId={deckId}
            cueId={cueId}
            position={[x, 0.02, z]}
          />
        )
      })}
      
      {/* Instructions */}
      <Text
        position={[0, 0.02, -0.12]}
        fontSize={0.012}
        color="#666"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
        maxWidth={0.3}
      >
        Click: Set/Jump | Shift+Click: Clear
      </Text>
    </group>
  )
}

