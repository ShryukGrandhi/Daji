import React, { useState, useEffect, Suspense, Component, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei'
import { createXRStore, XR } from '@react-three/xr'
import { Console } from './Console'
import { Sidebar } from '@/components/ui/Sidebar'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { useVoiceControl } from '@/hooks/useVoiceControl'

import { YouTubeManager } from '@/components/yt/YouTubeManager'

// Create XR Store (outside component to avoid recreation)
const xrStore = createXRStore()

// Error Boundary for catching WebGL/Three.js errors
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class SceneErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Scene Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white p-8">
          <h2 className="text-2xl font-bold mb-4 text-red-400">WebGL Error</h2>
          <p className="text-neutral-400 mb-4 text-center max-w-md">
            The 3D scene encountered an error. This may be due to WebGL compatibility issues.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium"
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading fallback for 3D content
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  )
}

function SceneContent() {
    useAudioEngine()
    
    return (
        <XR store={xrStore}>
            <ambientLight intensity={0.4} />
            <spotLight 
                position={[0, 4, 2]} 
                angle={0.6} 
                penumbra={0.5} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize={[1024, 1024]}
            />
            
            <pointLight position={[-3, 2, -3]} intensity={10} color="#3b82f6" distance={10} /> 
            <pointLight position={[3, 2, -3]} intensity={10} color="#d946ef" distance={10} />
            <pointLight position={[0, 5, 0]} intensity={5} color="#ffffff" distance={10} />

            <Suspense fallback={<LoadingFallback />}>
              <group position={[0, 1.0, -0.5]}>
                  <Console />
              </group>
            </Suspense>
            
            <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={10} blur={2.5} far={4} resolution={256} />
            
            <Environment preset="night" background blur={0.6} />
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.1} fade speed={1} />
            
            <OrbitControls target={[0, 1.1, -0.5]} makeDefault />
        </XR>
    )
}

function XRControls() {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex gap-4">
      <button
        onClick={() => xrStore.enterAR()}
        className="px-6 py-3 bg-neutral-800/80 hover:bg-neutral-700 text-white rounded-full font-bold backdrop-blur-md border border-white/10 transition-all"
      >
        Enter AR
      </button>
      <button
        onClick={() => xrStore.enterVR()}
        className="px-6 py-3 bg-blue-600/80 hover:bg-blue-500 text-white rounded-full font-bold backdrop-blur-md border border-white/10 transition-all shadow-lg shadow-blue-500/20"
      >
        Enter VR
      </button>
    </div>
  )
}

// Voice control button component - Click to start, click again to stop
function VoiceControlButton({ 
  isListening, 
  permissionDenied,
  onToggle
}: { 
  isListening: boolean
  permissionDenied: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={permissionDenied}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full
        flex items-center justify-center
        transition-all duration-300
        shadow-xl border-2
        ${permissionDenied 
          ? 'bg-red-600/80 border-red-400 cursor-not-allowed' 
          : isListening 
            ? 'bg-green-500 border-green-300 animate-pulse shadow-green-500/50 scale-110' 
            : 'bg-neutral-800 border-neutral-600 hover:bg-neutral-700 hover:scale-105'
        }
      `}
      title={
        permissionDenied 
          ? 'Microphone permission denied' 
          : isListening 
            ? 'Click to STOP listening' 
            : 'Click to START listening'
      }
    >
      {permissionDenied ? (
        // Mic blocked icon
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ) : isListening ? (
        // Stop icon (square)
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        // Mic icon
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  )
}

// Voice status indicator
function VoiceStatusBadge({ isListening, permissionDenied }: { isListening: boolean, permissionDenied: boolean }) {
  if (permissionDenied) {
    return (
      <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-600/90 text-white text-sm rounded-full flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-white/50"></span>
        Mic Denied
      </div>
    )
  }
  
  if (!isListening) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-green-600/90 text-white text-sm rounded-full flex items-center gap-2 shadow-lg animate-pulse">
      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
      Listening...
    </div>
  )
}

// New Debug Input Component
function DebugInput({ onCommand }: { onCommand: (cmd: string) => void }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onCommand(input)
      setInput('')
    }
  }

  return (
    <div className="fixed top-20 right-6 z-50">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type command..."
          className="px-4 py-2 bg-black/50 backdrop-blur text-white rounded-full border border-white/20 focus:outline-none focus:border-blue-500 text-sm w-48"
        />
        <button 
          type="submit"
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default function Scene() {
  const [mounted, setMounted] = useState(false)
  
  // Simplified voice control - click to start, click to stop
  const { isListening, permissionDenied, toggleListening, handleCommand } = useVoiceControl()

  // Ensure we're mounted before rendering WebGL content
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-900">
        <div className="text-white text-xl animate-pulse">Loading 3D Scene...</div>
      </div>
    )
  }

  return (
    <SceneErrorBoundary>
      <Sidebar />
      <XRControls />
      <VoiceStatusBadge isListening={isListening} permissionDenied={permissionDenied} />
      <DebugInput onCommand={handleCommand} />
      <YouTubeManager />
      <VoiceControlButton 
        isListening={isListening}
        permissionDenied={permissionDenied}
        onToggle={toggleListening}
      />
      <Canvas 
        shadows 
        camera={{ position: [0, 1.7, 0.8], fov: 55 }} 
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl }) => {
          // Handle WebGL context loss gracefully
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('WebGL context lost, attempting recovery...')
          })
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored')
          })
        }}
      >
        <SceneContent />
      </Canvas>
    </SceneErrorBoundary>
  )
}
