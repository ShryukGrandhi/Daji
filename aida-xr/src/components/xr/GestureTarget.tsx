import React, { useState } from 'react'
import { Sphere, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useDJStore } from '@/store/useDJStore'

export function GestureTarget() {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  const setCoachMessage = useDJStore((state) => state.setCoachMessage)
  const updateDeck = useDJStore((state) => state.updateDeck)

  useFrame((state) => {
    if (hovered) {
        // Wobbly effect when hovered
        const time = state.clock.elapsedTime
        // scaling logic...
    }
  })

  const handleGesture = () => {
    if (active) return
    setActive(true)
    setCoachMessage("GESTURE: Build-up Drop!")
    
    // Simulate a "Build-up" -> "Drop" effect
    // 1. High Pass Filter rises (cuts bass)
    // 2. Reverb increases
    // 3. Then everything snaps back
    
    let step = 0
    const interval = setInterval(() => {
        step += 1
        const progress = step / 40 // 2 seconds total (50ms * 40)
        
        if (progress >= 1) {
            clearInterval(interval)
            setActive(false)
            // DROP! Reset all
            updateDeck('A', { filter: 1, reverb: 0, distortion: 0 })
            updateDeck('B', { filter: 1, reverb: 0, distortion: 0 })
            setCoachMessage("DROP!")
        } else {
            // Rising tension
            // Filter goes from 1 (open) to 0.8 (slightly high passed)
            // Actually for Tone.js filter, 1 is open (20kHz). 
            // We want to High Pass... but our simple filter control is just a frequency knob. 
            // Let's just close the Low Pass filter to create a "muffled" build up then open it.
            
            const tension = Math.pow(progress, 2) // exponential curve
            
            // Muffle sound (Low Pass down to 500Hz)
            updateDeck('A', { filter: 1 - (tension * 0.8), reverb: tension * 0.5 })
            updateDeck('B', { filter: 1 - (tension * 0.8), reverb: tension * 0.5 })
        }
    }, 50)
  }

  return (
    <group>
      <Text position={[0, 0.15, 0]} fontSize={0.03} color="#fff" anchorX="center">
        GESTURE ZONE
      </Text>
      
      <Sphere 
        args={[0.1, 32, 32]} 
        onClick={handleGesture}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <meshStandardMaterial 
            color={active ? "#facc15" : (hovered ? "#22d3ee" : "#0ea5e9")} 
            emissive={active ? "#facc15" : (hovered ? "#22d3ee" : "#0ea5e9")}
            emissiveIntensity={0.5}
            wireframe={!active}
            transparent
            opacity={0.8}
        />
      </Sphere>
    </group>
  )
}

