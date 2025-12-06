import React, { useEffect, useRef } from 'react'
import YouTube, { YouTubePlayer } from 'react-youtube'
import { useDJStore } from '@/store/useDJStore'

interface YouTubeDeckProps {
  id: 'A' | 'B'
}

export function YouTubeDeck({ id }: YouTubeDeckProps) {
  const playerRef = useRef<YouTubePlayer | null>(null)
  
  // Subscribe to relevant state
  const deck = useDJStore((state) => id === 'A' ? state.deckA : state.deckB)
  const crossfader = useDJStore((state) => state.crossfader)
  const masterVolume = useDJStore((state) => state.masterVolume)
  
  // Calculate effective volume
  // Note: YT volume is 0-100
  const deckVolume = id === 'A' 
    ? Math.cos(crossfader * 0.5 * Math.PI) * deck.volume
    : Math.cos((1 - crossfader) * 0.5 * Math.PI) * deck.volume
    
  const effectiveVolume = deckVolume * masterVolume * 100

  // Sync Play/Pause
  useEffect(() => {
    if (!playerRef.current || deck.sourceType !== 'youtube') return
    
    if (deck.playing) {
      playerRef.current.playVideo()
    } else {
      playerRef.current.pauseVideo()
    }
  }, [deck.playing, deck.sourceType])

  // Sync Volume
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(effectiveVolume)
    }
  }, [effectiveVolume])

  // Handle Video ID Change
  // The YouTube component handles this via prop, but we might need to seek to start
  
  if (deck.sourceType !== 'youtube' || !deck.videoId) return null

  return (
    <div style={{ display: 'none' }}>
      <YouTube
        videoId={deck.videoId}
        opts={{
          height: '0',
          width: '0',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
          },
        }}
        onReady={(event) => {
          playerRef.current = event.target
          playerRef.current.setVolume(effectiveVolume)
          if (deck.playing) playerRef.current.playVideo()
        }}
        onStateChange={(event) => {
          // Sync state back to store if it ends or pauses externally
          // 0 = ended, 2 = paused
          if (event.data === 0) {
             useDJStore.getState().updateDeck(id, { playing: false })
          }
        }}
      />
    </div>
  )
}

