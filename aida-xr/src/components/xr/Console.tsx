import React from 'react'
import { RoundedBox, Box } from '@react-three/drei'
import { Deck } from './Deck'
import { Mixer } from './Mixer'
import { AIDJHelper } from './AIDJHelper'
import { TrackSelection } from './TrackSelection'
import { EffectsPanel } from './EffectsPanel'
import { HolographicWaveforms } from './HolographicWaveforms'
import { EmotionOrb } from './EmotionOrb'
import { RemixModeToggle } from './RemixModeToggle'
import { ChallengeHUD } from './ChallengeHUD'
import { AIGuidanceOrchestrator } from './AIGuidanceOrchestrator'
import { AutoMixSuggestionsPanel } from './AutoMixSuggestionsPanel'
import { WaveformScrubber } from './WaveformScrubber'
import { MasterFXSampler } from './MasterFXSampler'

export function Console(props: any) {
  return (
    <group {...props}>
      {/* Main Console Body */}
      <RoundedBox args={[2.6, 0.1, 1.1]} radius={0.05} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      
      {/* Console top surface */}
      <RoundedBox args={[2.6, 0.01, 1.1]} radius={0.05} position={[0, 0.005, 0]}>
        <meshStandardMaterial color="#222" emissive="#111" emissiveIntensity={0.2} />
      </RoundedBox>

      {/* Deck A - Left */}
      <group position={[-0.8, 0.08, 0.05]}>
        <Deck id="A" label="DECK A" />
      </group>

      {/* Mixer - Center */}
      <group position={[0, 0.08, 0.05]}>
        <Mixer />
      </group>

      {/* Deck B - Right */}
      <group position={[0.8, 0.08, 0.05]}>
        <Deck id="B" label="DECK B" />
      </group>

      {/* Effects Panel A - Left side */}
      <group position={[-1.2, 0.08, 0.12]}>
        <EffectsPanel side="left" />
      </group>

      {/* Effects Panel B - Right side */}
      <group position={[1.2, 0.08, 0.12]}>
        <EffectsPanel side="right" />
      </group>

      {/* Holographic Waveforms - Above decks */}
      <group position={[-0.8, 0.35, 0.15]} scale={[0.6, 0.6, 0.6]}>
        <HolographicWaveforms deckId="A" />
      </group>
      <group position={[0.8, 0.35, 0.15]} scale={[0.6, 0.6, 0.6]}>
        <HolographicWaveforms deckId="B" />
      </group>

      {/* Waveform Scrubbers - Front edge */}
      <group position={[-0.8, 0.08, 0.45]}>
        <WaveformScrubber deckId="A" position={[0, 0, 0]} />
      </group>
      <group position={[0.8, 0.08, 0.45]}>
        <WaveformScrubber deckId="B" position={[0, 0, 0]} />
      </group>

      {/* Master FX & Sampler - Front center */}
      <group position={[0, 0.08, 0.5]}>
        <MasterFXSampler />
      </group>

      {/* Vibe & Remix Controls - Back corners */}
      <group position={[-0.6, 0.12, -0.3]}>
        <EmotionOrb />
      </group>
      <group position={[0.6, 0.12, -0.3]}>
        <RemixModeToggle />
      </group>

      {/* ========== FLOATING UI PANELS ========== */}
      {/* Clean layout - no overlapping */}

      {/* AI DJ Helper - Center top, main focus */}
      <group position={[0, 0.75, -0.5]} scale={[1.1, 1.1, 1]}>
        <AIDJHelper />
      </group>

      {/* Challenge HUD - Top center above AI Helper */}
      <group position={[0, 1.15, -0.7]} scale={[0.75, 0.75, 1]}>
        <ChallengeHUD />
      </group>

      {/* Track Selection - Right side, angled inward */}
      <group position={[0.9, 0.55, -0.3]} rotation={[0, -0.35, 0]} scale={[0.7, 0.7, 1]}>
        <TrackSelection />
      </group>

      {/* Auto-Mix Suggestions - Left side, angled inward (only shows when active) */}
      <group position={[-0.9, 0.55, -0.3]} rotation={[0, 0.35, 0]} scale={[0.7, 0.7, 1]}>
        <AutoMixSuggestionsPanel />
      </group>

      {/* AI Guidance System - Overlays visual guidance (hidden during demo) */}
      <AIGuidanceOrchestrator />
    </group>
  )
}
