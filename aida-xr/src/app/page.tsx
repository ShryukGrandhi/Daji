'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'

// Only load Scene component on client side, with a loading state
const Scene = dynamic(() => import('@/components/xr/Scene'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-900">
      <div className="text-white text-xl animate-pulse">Loading 3D Console...</div>
    </div>
  )
})

export default function Home() {
  const [started, setStarted] = useState(false)

  const handleStart = useCallback(async () => {
    try {
      // Import Tone only on user gesture
      const Tone = await import('tone')
      await Tone.start()
      
      // Double-check the context is actually running
      if (Tone.context.state !== 'running') {
        await Tone.context.resume()
      }
      
      console.log("Audio Context Started:", Tone.context.state)
      setStarted(true)
    } catch (e) {
      console.error("Failed to start audio:", e)
      // Still allow starting even if audio fails
      setStarted(true)
    }
  }, [])

  return (
    <div className="w-full h-screen bg-neutral-900 text-white overflow-hidden relative font-sans selection:bg-blue-500/30">
      {/* Header UI */}
      <div className={`absolute top-4 left-4 z-20 transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
            AIDA <span className="text-sm font-normal text-neutral-400 tracking-widest ml-2">XR DJ CONSOLE</span>
        </h1>
      </div>

      {/* Start Screen Overlay */}
      {!started && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center">
            <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                AIDA XR
            </h1>
            <p className="text-xl text-neutral-400 mb-8 max-w-md">
                Your AI DJ Assistant <br/>
                <span className="text-sm opacity-70">Voice-controlled mixing in Desktop, AR, and VR.</span>
            </p>
            
            <button 
                onClick={handleStart}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-xl tracking-wide hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
            >
                <span className="relative z-10">ENTER CONSOLE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
            
            <p className="mt-8 text-neutral-600 text-xs uppercase tracking-widest">
                Click the mic button to talk to your AI DJ
            </p>
        </div>
      )}

      {/* XR Canvas - Only mount when started */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
        {started && <Scene />}
      </div>
      
      {/* Instructions Footer */}
      <div className={`absolute bottom-24 left-0 w-full text-center pointer-events-none z-10 transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
         <div className="bg-black/30 backdrop-blur-md inline-block px-6 py-2 rounded-full border border-white/5 text-neutral-400 text-sm">
            Click the <span className="text-green-400 font-medium">microphone</span> to talk • Say <span className="text-white font-medium">"Play some house music"</span> or <span className="text-cyan-400 font-medium">"Help me mix"</span>
         </div>
      </div>
    </div>
  )
}
