import React from 'react'
import { RoundedBox } from '@react-three/drei'
import { Deck } from './Deck'
import { Mixer } from './Mixer'
import { AIDJHelper } from './AIDJHelper'
import { TrackSelection } from './TrackSelection'
import { EffectsPanel } from './EffectsPanel'
import { HolographicWaveforms } from './HolographicWaveforms'
import { EmotionOrb } from './EmotionOrb'
import { RemixModeToggle } from './RemixModeToggle'
import { ChallengeHUD } from './ChallengeHUD'

export function Console(props: any) {
  return (
    <group {...props}>
      {/* Main Console Body */}
      <RoundedBox args={[2.4, 0.1, 1.0]} radius={0.05} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      
      {/* Front edge accent */}
      <RoundedBox args={[2.4, 0.04, 0.04]} radius={0.01} position={[0, 0.01, 0.48]}>
        <meshStandardMaterial color="#1e293b" />
      </RoundedBox>

      {/* Deck A - Left */}
      <group position={[-0.7, 0.02, 0.05]}>
        <Deck id="A" label="DECK A" />
      </group>

      {/* Mixer - Center */}
      <group position={[0, 0.02, 0.05]}>
        <Mixer />
      </group>

      {/* Deck B - Right */}
      <group position={[0.7, 0.02, 0.05]}>
        <Deck id="B" label="DECK B" />
      </group>

      {/* Effects Panel A - Far Left */}
      <group position={[-1.05, 0.02, 0.1]}>
        <EffectsPanel side="left" />
      </group>

      {/* Effects Panel B - Far Right */}
      <group position={[1.05, 0.02, 0.1]}>
        <EffectsPanel side="right" />
      </group>

      {/* Holographic Waveforms - Deck A */}
      <group position={[-0.7, 0.15, -0.3]}>
        <HolographicWaveforms deckId="A" />
      </group>

      {/* Holographic Waveforms - Deck B */}
      <group position={[0.7, 0.15, -0.3]}>
        <HolographicWaveforms deckId="B" />
      </group>

      {/* Vibe Controls - integrated into console surface */}
      <group position={[0, 0.05, -0.35]}>
        <EmotionOrb />
      </group>

      {/* Remix Toggle - beside Vibe */}
      <group position={[0.4, 0.05, -0.35]}>
        <RemixModeToggle />
      </group>

      {/* AI DJ Helper - Clean Wall Display */}
      <group position={[0, 0.8, -1.2]} scale={[1.2, 1.2, 1]}>
        <AIDJHelper />
      </group>

      {/* Challenge HUD - Top banner */}
      <group position={[0, 1.4, -1.5]} scale={[1.2, 1.2, 1]}>
        <ChallengeHUD />
      </group>

      {/* Track Selection Panel - Side Monitor */}
      <group position={[1.5, 0.5, -0.3]} rotation={[0, -0.4, 0]}>
        <TrackSelection />
      </group>
    </group>
  )
}
