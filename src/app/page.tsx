'use client'

import dynamic from 'next/dynamic'
import { useVoiceControl } from '@/hooks/useVoiceControl'

const Scene = dynamic(() => import('@/components/xr/Scene'), { ssr: false })

export default function Home() {
  // Initialize voice control
  const { isListening } = useVoiceControl()

  return (
    <div className="w-full h-screen bg-neutral-900 text-white overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold tracking-tighter">AIDA <span className="text-xs font-normal text-neutral-400">XR DJ CONSOLE</span></h1>
        <div className="flex items-center gap-2 mt-2">
           <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-neutral-600'}`} />
           <span className="text-xs uppercase tracking-widest text-neutral-500">{isListening ? "Listening..." : "Mic Off"}</span>
        </div>
      </div>

      {/* XR Canvas */}
      <Scene />
      
      <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
         <p className="text-sm text-neutral-500">Say "Help" or "Coach Mode" to begin.</p>
      </div>
    </div>
  )
}



