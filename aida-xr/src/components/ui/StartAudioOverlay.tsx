import React, { useState, useEffect } from 'react'
import * as Tone from 'tone'

export function StartAudioOverlay() {
  const [started, setStarted] = useState(false)

  const handleStart = async () => {
    await Tone.start()
    await Tone.context.resume()
    console.log('Audio Context Started:', Tone.context.state)
    setStarted(true)
  }

  if (started) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <button 
        onClick={handleStart}
        className="px-8 py-4 text-2xl font-bold text-black bg-cyan-400 rounded-full hover:bg-cyan-300 hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.5)]"
      >
        CLICK TO START AIDA DJ
      </button>
    </div>
  )
}

