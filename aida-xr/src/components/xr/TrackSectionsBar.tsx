import React from 'react'
import { Box, Text, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

interface TrackSectionsBarProps {
  deckId: 'A' | 'B'
}

export function TrackSectionsBar({ deckId }: TrackSectionsBarProps) {
  const sections = useDJStore((state) => deckId === 'A' ? state.trackSections.A : state.trackSections.B)
  const setTrackSections = useDJStore((state) => state.setTrackSections)
  
  const handleMove = (index: number, direction: -1 | 1) => {
      const newSections = [...sections]
      const targetIndex = index + direction
      
      if (targetIndex >= 0 && targetIndex < newSections.length) {
          // Swap
          const temp = newSections[index]
          newSections[index] = newSections[targetIndex]
          newSections[targetIndex] = temp
          
          // Update orderIndex
          newSections.forEach((s, i) => s.orderIndex = i)
          
          setTrackSections(deckId, newSections)
      }
  }

  return (
    <group>
        <Text position={[0, 0.1, 0]} fontSize={0.03} color="white" anchorX="center">
            DECK {deckId} STRUCTURE
        </Text>
        <group position={[-0.3, 0, 0]}>
            {sections.map((section, i) => (
                <group key={section.id} position={[i * 0.22, 0, 0]}>
                    <RoundedBox 
                        args={[0.2, 0.1, 0.05]} 
                        radius={0.01}
                        onClick={(e) => {
                            e.stopPropagation()
                            // Simple click to move right, shift-click (not really in VR) to move left?
                            // For MVP: Click left side to move left, right side to move right
                            // Or just cycle forward
                            handleMove(i, 1)
                        }}
                    >
                        <meshStandardMaterial color={section.color} />
                    </RoundedBox>
                    <Text position={[0, 0, 0.03]} fontSize={0.03} color="white">
                        {section.label}
                    </Text>
                    <Text position={[0, -0.08, 0]} fontSize={0.015} color="#aaa">
                        {section.duration}s
                    </Text>
                </group>
            ))}
        </group>
    </group>
  )
}

