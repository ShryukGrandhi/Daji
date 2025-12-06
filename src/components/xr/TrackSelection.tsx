import React from 'react'
import { Text, Plane } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

export function TrackSelection() {
  const tracks = useDJStore((state) => state.suggestedTracks)
  const updateDeck = useDJStore((state) => state.updateDeck)

  const loadTrack = (track: { title: string, bpm: number }, deck: 'A' | 'B') => {
      updateDeck(deck, { track: track.title, bpm: track.bpm })
  }

  if (tracks.length === 0) return null

  return (
    <group>
        <Text position={[0, 0.3, 0]} fontSize={0.04} color="#fff">SUGGESTED TRACKS</Text>
        {tracks.map((track, i) => (
            <group key={track.id} position={[0, -i * 0.25, 0]}>
                {/* Card Background */}
                <Plane args={[0.6, 0.2]} onClick={() => loadTrack(track, 'A')}>
                    <meshStandardMaterial color="#222" />
                </Plane>
                {/* Border */}
                 <Plane args={[0.62, 0.22]} position={[0, 0, -0.01]}>
                    <meshBasicMaterial color="#555" />
                </Plane>
                
                <Text position={[-0.25, 0.05, 0.01]} fontSize={0.03} anchorX="left" color="white">{track.title}</Text>
                <Text position={[-0.25, -0.05, 0.01]} fontSize={0.02} anchorX="left" color="#aaa">{track.bpm} BPM • {track.mood}</Text>
                
                <group position={[0.2, 0, 0.02]} onClick={(e) => { e.stopPropagation(); loadTrack(track, 'B') }}>
                     <Plane args={[0.1, 0.1]}>
                         <meshBasicMaterial color="#3b82f6" />
                     </Plane>
                     <Text position={[0, 0, 0.01]} fontSize={0.02}>Load B</Text>
                </group>
            </group>
        ))}
    </group>
  )
}

