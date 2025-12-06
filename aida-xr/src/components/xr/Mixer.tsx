import React from 'react'
import { Box, Cylinder, Text, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

export function Mixer() {
  const crossfader = useDJStore((state) => state.crossfader)
  const setCrossfader = useDJStore((state) => state.setCrossfader)
  const updateDeck = useDJStore((state) => state.updateDeck)
  const stemMode = useDJStore((state) => state.stemMode)
  const toggleStemMode = useDJStore((state) => state.toggleStemMode)
  
  const deckAVolume = useDJStore((state) => state.deckA.volume)
  const deckBVolume = useDJStore((state) => state.deckB.volume)
  const deckAFilter = useDJStore((state) => state.deckA.filter)
  const deckBFilter = useDJStore((state) => state.deckB.filter)
  const deckAEqLow = useDJStore((state) => state.deckA.eq.low)
  const deckAEqHigh = useDJStore((state) => state.deckA.eq.high)
  const deckBEqLow = useDJStore((state) => state.deckB.eq.low)
  const deckBEqHigh = useDJStore((state) => state.deckB.eq.high)

  return (
    <group>
      {/* Main mixer body */}
      <RoundedBox args={[0.55, 0.06, 0.85]} radius={0.02} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.6} />
      </RoundedBox>

      {/* STEMS / EQ Toggle Button */}
      <group position={[0, 0.04, -0.15]} onClick={toggleStemMode}>
        <RoundedBox args={[0.12, 0.015, 0.06]} radius={0.005}>
          <meshStandardMaterial 
            color={stemMode ? "#d946ef" : "#333"} 
            emissive={stemMode ? "#d946ef" : "#000"}
            emissiveIntensity={stemMode ? 0.5 : 0}
          />
        </RoundedBox>
        <Text position={[0, 0.008, 0]} fontSize={0.02} color="#fff" rotation={[-Math.PI/2,0,0]}>
          {stemMode ? "STEMS ON" : "EQ MODE"}
        </Text>
      </group>

      {/* CROSSFADER Section */}
      <group position={[0, 0.04, 0.35]}>
        <Text position={[0, 0, -0.06]} fontSize={0.02} rotation={[-Math.PI/2, 0, 0]} color="#888">CROSSFADER</Text>
        
        {/* Crossfader track */}
        <Box args={[0.35, 0.008, 0.02]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#000" />
        </Box>
        
        {/* Tick marks */}
        {[-0.15, -0.075, 0, 0.075, 0.15].map((x, i) => (
          <Box key={i} args={[0.002, 0.001, 0.03]} position={[x, 0, 0]}>
            <meshBasicMaterial color={i === 2 ? "#fff" : "#444"} />
          </Box>
        ))}

        {/* Crossfader handle - clickable zones */}
        <group position={[-0.12, 0, 0]} onClick={() => setCrossfader(Math.max(0, crossfader - 0.1))}>
          <Box args={[0.08, 0.03, 0.04]} position={[0, 0.02, 0]}>
            <meshStandardMaterial color="#222" transparent opacity={0.5} />
          </Box>
        </group>
        <group position={[0.12, 0, 0]} onClick={() => setCrossfader(Math.min(1, crossfader + 0.1))}>
          <Box args={[0.08, 0.03, 0.04]} position={[0, 0.02, 0]}>
            <meshStandardMaterial color="#222" transparent opacity={0.5} />
          </Box>
        </group>

        {/* Crossfader handle */}
        <Box args={[0.04, 0.04, 0.025]} position={[(crossfader - 0.5) * 0.3, 0.02, 0]}>
          <meshStandardMaterial color="#ddd" metalness={0.8} roughness={0.2} />
        </Box>
        
        {/* A/B Labels */}
        <Text position={[-0.2, 0, 0]} fontSize={0.025} rotation={[-Math.PI/2, 0, 0]} color="#ef4444" fontWeight="bold">A</Text>
        <Text position={[0.2, 0, 0]} fontSize={0.025} rotation={[-Math.PI/2, 0, 0]} color="#3b82f6" fontWeight="bold">B</Text>
      </group>

      {/* Channel A Strip */}
      <group position={[-0.15, 0, 0]}>
        <ChannelStrip 
          label="A" 
          color="#ef4444" 
          volume={deckAVolume}
          filter={deckAFilter}
          eqLow={deckAEqLow}
          eqHigh={deckAEqHigh}
          stemMode={stemMode}
          onVolumeChange={(v) => updateDeck('A', { volume: v })}
          onFilterChange={(v) => updateDeck('A', { filter: v })}
          onEqLowChange={(v) => updateDeck('A', { eq: { low: v, mid: 0.5, high: deckAEqHigh } })}
          onEqHighChange={(v) => updateDeck('A', { eq: { low: deckAEqLow, mid: 0.5, high: v } })}
        />
      </group>

      {/* Channel B Strip */}
      <group position={[0.15, 0, 0]}>
        <ChannelStrip 
          label="B" 
          color="#3b82f6"
          volume={deckBVolume}
          filter={deckBFilter}
          eqLow={deckBEqLow}
          eqHigh={deckBEqHigh}
          stemMode={stemMode}
          onVolumeChange={(v) => updateDeck('B', { volume: v })}
          onFilterChange={(v) => updateDeck('B', { filter: v })}
          onEqLowChange={(v) => updateDeck('B', { eq: { low: v, mid: 0.5, high: deckBEqHigh } })}
          onEqHighChange={(v) => updateDeck('B', { eq: { low: deckBEqLow, mid: 0.5, high: v } })}
        />
      </group>

      {/* Master Volume */}
      <group position={[0, 0.04, -0.28]}>
        <Text position={[0, 0, -0.08]} fontSize={0.02} rotation={[-Math.PI/2, 0, 0]} color="#fff">MASTER</Text>
        <Box args={[0.02, 0.01, 0.12]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#000" />
        </Box>
        <Box args={[0.05, 0.025, 0.025]} position={[0, 0.015, 0.03]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </Box>
        {/* Level meters */}
        <group position={[-0.04, 0, 0]}>
          <VUMeter level={0.7} />
        </group>
        <group position={[0.04, 0, 0]}>
          <VUMeter level={0.6} />
        </group>
      </group>
    </group>
  )
}

interface ChannelStripProps {
  label: string
  color: string
  volume: number
  filter: number
  eqLow: number
  eqHigh: number
  stemMode: boolean
  onVolumeChange: (v: number) => void
  onFilterChange: (v: number) => void
  onEqLowChange: (v: number) => void
  onEqHighChange: (v: number) => void
}

function ChannelStrip({ label, color, volume, filter, eqLow, eqHigh, stemMode, onVolumeChange, onFilterChange, onEqLowChange, onEqHighChange }: ChannelStripProps) {
  return (
    <group>
      {/* Channel label */}
      <Text position={[0, 0.04, -0.38]} fontSize={0.05} rotation={[-Math.PI/2, 0, 0]} color={color} fontWeight="bold">{label}</Text>

      {/* FILTER Knob */}
      <group position={[0, 0.04, -0.28]}>
        <InteractiveKnob 
          label="FILTER" 
          color={color} 
          size={0.035} 
          value={filter}
          onChange={onFilterChange}
        />
      </group>

      {/* HIGH EQ / DRUMS Knob */}
      <group position={[0, 0.04, -0.18]}>
        <InteractiveKnob 
          label={stemMode ? "DRUMS" : "HI"} 
          color={stemMode ? "#60a5fa" : "#ddd"} 
          size={0.028} 
          value={eqHigh}
          onChange={onEqHighChange}
        />
      </group>

      {/* MID EQ / VOCALS Knob (decorative for now) */}
      <group position={[0, 0.04, -0.08]}>
        <InteractiveKnob 
          label={stemMode ? "VOCALS" : "MID"} 
          color={stemMode ? "#f472b6" : "#ddd"} 
          size={0.028} 
          value={0.5}
          onChange={() => {}}
        />
      </group>

      {/* LOW EQ / BASS Knob */}
      <group position={[0, 0.04, 0.02]}>
        <InteractiveKnob 
          label={stemMode ? "BASS" : "LO"} 
          color={stemMode ? "#818cf8" : "#ddd"} 
          size={0.028} 
          value={eqLow}
          onChange={onEqLowChange}
        />
      </group>
      
      {/* Volume Fader */}
      <group position={[0, 0.04, 0.18]}>
        <Text position={[0, 0, -0.06]} fontSize={0.015} rotation={[-Math.PI/2, 0, 0]} color="#666">VOL</Text>
        <Box args={[0.02, 0.008, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#000" />
        </Box>
        {/* Fader handle */}
        <Box args={[0.04, 0.025, 0.02]} position={[0, 0.015, (volume - 0.5) * 0.08]}>
          <meshStandardMaterial color={color} />
        </Box>
        {/* Click zones */}
        <group position={[0, 0.01, -0.03]} onClick={() => onVolumeChange(Math.max(0, volume - 0.1))}>
          <Box args={[0.05, 0.02, 0.03]}><meshStandardMaterial color="#111" transparent opacity={0.3} /></Box>
        </group>
        <group position={[0, 0.01, 0.03]} onClick={() => onVolumeChange(Math.min(1, volume + 0.1))}>
          <Box args={[0.05, 0.02, 0.03]}><meshStandardMaterial color="#111" transparent opacity={0.3} /></Box>
        </group>
      </group>

      {/* Channel Level Meter */}
      <group position={[0.06, 0.04, 0.18]}>
        <VUMeter level={volume * 0.8} color={color} />
      </group>
    </group>
  )
}

interface KnobProps {
  label: string
  color: string
  size: number
  value: number
  onChange: (v: number) => void
}

function InteractiveKnob({ label, color, size, value, onChange }: KnobProps) {
  const rotation = (value - 0.5) * Math.PI * 1.5

  return (
    <group>
      <Cylinder args={[size, size, 0.025, 32]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </Cylinder>
      <Box args={[0.004, 0.026, size * 0.7]} position={[0, 0, size * 0.35]} rotation={[0, rotation, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Box>
      <Text position={[0, 0.013, size + 0.025]} fontSize={0.012} rotation={[-Math.PI/2, 0, 0]} color="#666">{label}</Text>
      
      <group position={[-size, 0, 0]} onClick={() => onChange(Math.max(0, value - 0.1))}>
        <Box args={[size, 0.03, size * 2]}><meshStandardMaterial color="#000" transparent opacity={0} /></Box>
      </group>
      <group position={[size, 0, 0]} onClick={() => onChange(Math.min(1, value + 0.1))}>
        <Box args={[size, 0.03, size * 2]}><meshStandardMaterial color="#000" transparent opacity={0} /></Box>
      </group>
    </group>
  )
}

function VUMeter({ level, color = "#10b981" }: { level: number, color?: string }) {
  const segments = 8
  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => {
        const segmentLevel = (i + 1) / segments
        const isActive = level >= segmentLevel
        const segmentColor = i >= 6 ? "#ef4444" : i >= 4 ? "#f59e0b" : color
        return (
          <Box key={i} args={[0.015, 0.006, 0.008]} position={[0, 0, -0.04 + i * 0.01]}>
            <meshStandardMaterial 
              color={isActive ? segmentColor : "#222"} 
              emissive={isActive ? segmentColor : "#000"}
              emissiveIntensity={isActive ? 0.5 : 0}
            />
          </Box>
        )
      })}
    </group>
  )
}
