import React from 'react'
import { Text, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

export function TrackSelection() {
  const tracks = useDJStore((state) => state.suggestedTracks)
  const updateDeck = useDJStore((state) => state.updateDeck)
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)

  const loadTrack = (track: { title: string, bpm: number, url?: string }, deck: 'A' | 'B') => {
    updateDeck(deck, { 
      track: track.title.slice(0, 25),
      bpm: track.bpm || 120,
      url: track.url || null,
      playing: true,
      sourceType: 'local'
    })
    setCoachMessage(`Loaded "${track.title.slice(0, 15)}..." on ${deck}`)
  }

  return (
    <group>
      {/* Header */}
      <RoundedBox args={[0.5, 0.05, 0.01]} radius={0.01} position={[0, 0.18, 0]}>
        <meshStandardMaterial color="#10b981" />
      </RoundedBox>
      <Text position={[0, 0.18, 0.01]} fontSize={0.02} color="#000" fontWeight="bold">
        TRACKS
      </Text>

      {/* Track List */}
      {tracks.slice(0, 4).map((track, i) => (
        <group key={track.id} position={[0, 0.1 - i * 0.1, 0]}>
          <RoundedBox args={[0.5, 0.08, 0.01]} radius={0.008}>
            <meshStandardMaterial color="#1a1a1a" />
          </RoundedBox>
          
          <Text position={[-0.22, 0.01, 0.01]} fontSize={0.018} anchorX="left" color="white" maxWidth={0.3}>
            {track.title.slice(0, 18)}
          </Text>
          <Text position={[-0.22, -0.015, 0.01]} fontSize={0.012} anchorX="left" color="#888">
            {track.bpm} BPM
          </Text>
          
          {/* Load Buttons */}
          <group position={[0.17, 0, 0.01]} onClick={() => loadTrack(track, 'A')}>
            <RoundedBox args={[0.05, 0.05, 0.008]} radius={0.005}>
              <meshStandardMaterial color="#ef4444" />
            </RoundedBox>
            <Text position={[0, 0, 0.005]} fontSize={0.02} color="#fff" fontWeight="bold">A</Text>
          </group>
          
          <group position={[0.22, 0, 0.01]} onClick={() => loadTrack(track, 'B')}>
            <RoundedBox args={[0.05, 0.05, 0.008]} radius={0.005}>
              <meshStandardMaterial color="#3b82f6" />
            </RoundedBox>
            <Text position={[0, 0, 0.005]} fontSize={0.02} color="#fff" fontWeight="bold">B</Text>
          </group>
        </group>
      ))}
    </group>
  )
}
