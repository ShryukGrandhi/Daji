import React from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Console } from './Console'

const store = createXRStore()

export default function Scene() {
  return (
    <>
      <div className="absolute bottom-4 right-4 z-50 flex gap-2">
        <button 
           onClick={() => store.enterAR()}
           className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full font-medium transition-colors border border-neutral-600"
        >
           Enter AR
        </button>
        <button 
           onClick={() => store.enterVR()}
           className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
           Enter VR
        </button>
      </div>

      <Canvas camera={{ position: [0, 1.6, 1], fov: 50 }}>
        <XR store={store}>
            <ambientLight intensity={0.5} />
            <spotLight position={[0, 4, 2]} angle={0.5} penumbra={1} intensity={2} castShadow />
            
            {/* Rim light for that "High-End Product" look */}
            <pointLight position={[-2, 2, -2]} intensity={5} color="#3b82f6" /> 
            <pointLight position={[2, 2, -2]} intensity={5} color="#d946ef" />

            <group position={[0, 1.1, -0.5]}>
                <Console />
            </group>
            
            <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
            <Environment preset="city" />
            
            <OrbitControls target={[0, 1.1, -0.5]} makeDefault />
        </XR>
      </Canvas>
    </>
  )
}



