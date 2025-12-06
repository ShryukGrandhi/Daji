import { useEffect, useRef } from 'react'
import { useDJStore } from '@/store/useDJStore'

type ToneModule = typeof import('tone')

const safeRampTo = (param: any, value: number, rampTime: number) => {
  if (param && typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    try {
      if (param.units === 'hertz' || param.name === 'frequency') {
        param.rampTo(Math.max(20, value), rampTime)
      } else {
        param.rampTo(value, rampTime)
      }
    } catch (e) {
      console.warn('Audio ramp error:', e)
    }
  }
}

export function useAudioEngine() {
  // Deck A state
  const deckAPlaying = useDJStore((s) => s.deckA.playing)
  const deckASource = useDJStore((s) => s.deckA.sourceType)
  const deckAUrl = useDJStore((s) => s.deckA.url)
  const deckAVolume = useDJStore((s) => s.deckA.volume)
  const deckAEqLow = useDJStore((s) => s.deckA.eq.low)
  const deckAEqMid = useDJStore((s) => s.deckA.eq.mid)
  const deckAEqHigh = useDJStore((s) => s.deckA.eq.high)
  const deckAFilter = useDJStore((s) => s.deckA.filter)
  const deckAStartPos = useDJStore((s) => s.deckA.startPosition)
  const deckAReverb = useDJStore((s) => s.deckA.reverb)
  const deckADelay = useDJStore((s) => s.deckA.delay)
  const deckADistortion = useDJStore((s) => s.deckA.distortion)
  const deckAPlaybackRate = useDJStore((s) => s.deckA.playbackRate)
  
  // Deck B state
  const deckBPlaying = useDJStore((s) => s.deckB.playing)
  const deckBSource = useDJStore((s) => s.deckB.sourceType)
  const deckBUrl = useDJStore((s) => s.deckB.url)
  const deckBVolume = useDJStore((s) => s.deckB.volume)
  const deckBEqLow = useDJStore((s) => s.deckB.eq.low)
  const deckBEqMid = useDJStore((s) => s.deckB.eq.mid)
  const deckBEqHigh = useDJStore((s) => s.deckB.eq.high)
  const deckBFilter = useDJStore((s) => s.deckB.filter)
  const deckBStartPos = useDJStore((s) => s.deckB.startPosition)
  const deckBReverb = useDJStore((s) => s.deckB.reverb)
  const deckBDelay = useDJStore((s) => s.deckB.delay)
  const deckBDistortion = useDJStore((s) => s.deckB.distortion)
  const deckBPlaybackRate = useDJStore((s) => s.deckB.playbackRate)
  
  const crossfader = useDJStore((s) => s.crossfader)
  const masterVolume = useDJStore((s) => s.masterVolume)
  const spatialSources = useDJStore((s) => s.spatialSources)

  // Refs
  const toneRef = useRef<ToneModule | null>(null)
  const masterGainRef = useRef<any>(null)
  const gainARef = useRef<any>(null)
  const gainBRef = useRef<any>(null)
  const pannerARef = useRef<any>(null)
  const pannerBRef = useRef<any>(null)
  const filterARef = useRef<any>(null)
  const filterBRef = useRef<any>(null)
  const eqARef = useRef<any>(null)
  const eqBRef = useRef<any>(null)
  const playerARef = useRef<any>(null)
  const playerBRef = useRef<any>(null)
  const reverbARef = useRef<any>(null)
  const reverbBRef = useRef<any>(null)
  const delayARef = useRef<any>(null)
  const delayBRef = useRef<any>(null)
  const distortionARef = useRef<any>(null)
  const distortionBRef = useRef<any>(null)
  const currentUrlARef = useRef<string | null>(null)
  const currentUrlBRef = useRef<string | null>(null)

  const isSetup = useRef(false)
  const setupAttempted = useRef(false)

  // Setup audio engine
  useEffect(() => {
    if (setupAttempted.current) return
    setupAttempted.current = true

    const setup = async () => {
      try {
        const Tone = await import('tone')
        toneRef.current = Tone

        let attempts = 0
        while (Tone.context.state !== 'running' && attempts < 100) {
          await new Promise(r => setTimeout(r, 50))
          attempts++
          if (Tone.context.state === 'suspended') {
            try { await Tone.context.resume() } catch {}
          }
        }

        if (Tone.context.state !== 'running') {
          console.warn('[Audio] Context not running')
          return
        }

        console.log("[Audio] Setting up...")

        // Master output
        const masterGain = new Tone.Gain(0.8).toDestination()
        masterGainRef.current = masterGain

        // DECK A chain
        const gainA = new Tone.Gain(0.5).connect(masterGain)
        const pannerA = new Tone.Panner(0).connect(gainA)
        const eqA = new Tone.EQ3(0, 0, 0).connect(pannerA)
        const filterA = new Tone.Filter(20000, "lowpass").connect(eqA)
        const reverbA = new Tone.Reverb({ decay: 2, wet: 0 }).connect(filterA)
        const delayA = new Tone.FeedbackDelay({ delayTime: 0.25, feedback: 0.3, wet: 0 }).connect(reverbA)
        const distortionA = new Tone.Distortion({ distortion: 0, wet: 0 }).connect(delayA)
        const playerA = new Tone.Player({ loop: true, autostart: false }).connect(distortionA)

        // DECK B chain
        const gainB = new Tone.Gain(0.5).connect(masterGain)
        const pannerB = new Tone.Panner(0).connect(gainB)
        const eqB = new Tone.EQ3(0, 0, 0).connect(pannerB)
        const filterB = new Tone.Filter(20000, "lowpass").connect(eqB)
        const reverbB = new Tone.Reverb({ decay: 2, wet: 0 }).connect(filterB)
        const delayB = new Tone.FeedbackDelay({ delayTime: 0.25, feedback: 0.3, wet: 0 }).connect(reverbB)
        const distortionB = new Tone.Distortion({ distortion: 0, wet: 0 }).connect(delayB)
        const playerB = new Tone.Player({ loop: true, autostart: false }).connect(distortionB)

        // Store refs
        gainARef.current = gainA
        gainBRef.current = gainB
        pannerARef.current = pannerA
        pannerBRef.current = pannerB
        filterARef.current = filterA
        filterBRef.current = filterB
        eqARef.current = eqA
        eqBRef.current = eqB
        playerARef.current = playerA
        playerBRef.current = playerB
        reverbARef.current = reverbA
        reverbBRef.current = reverbB
        delayARef.current = delayA
        delayBRef.current = delayB
        distortionARef.current = distortionA
        distortionBRef.current = distortionB

        isSetup.current = true
        console.log("[Audio] Ready!")
        
      } catch (e) {
        console.error("[Audio] Setup failed:", e)
      }
    }

    setup()
    
    return () => {
      playerARef.current?.stop()
      playerBRef.current?.stop()
    }
  }, [])

  // Load Deck A
  useEffect(() => {
    if (!isSetup.current || !playerARef.current || !deckAUrl) return
    if (deckAUrl === currentUrlARef.current) return
    
    const load = async () => {
      currentUrlARef.current = deckAUrl
      try {
        playerARef.current.stop()
        // Only load if local. YouTube is handled by YouTubeDeck component.
        if (deckASource === 'local') {
            await playerARef.current.load(deckAUrl)
            if (deckAPlaying) playerARef.current.start()
        }
      } catch (err) {
        console.warn("[Audio] A load warn:", err)
      }
    }
    load()
  }, [deckAUrl, deckASource])

  // Load Deck B
  useEffect(() => {
    if (!isSetup.current || !playerBRef.current || !deckBUrl) return
    if (deckBUrl === currentUrlBRef.current) return
    
    const load = async () => {
      currentUrlBRef.current = deckBUrl
      try {
        playerBRef.current.stop()
        if (deckBSource === 'local') {
            await playerBRef.current.load(deckBUrl)
            if (deckBPlaying) playerBRef.current.start()
        }
      } catch (err) {
        console.warn("[Audio] B load warn:", err)
      }
    }
    load()
  }, [deckBUrl, deckBSource])

  // Play/Stop A & Playback Rate
  useEffect(() => {
    if (!isSetup.current || !playerARef.current) return
    
    // Only control Tone player if source is local
    if (deckASource === 'local') {
        if (deckAPlaying && playerARef.current.loaded) {
            if (playerARef.current.state !== 'started') playerARef.current.start()
        } else {
            playerARef.current.stop()
        }
        // Update playback rate (time stretching)
        if (playerARef.current.playbackRate !== deckAPlaybackRate) {
            playerARef.current.playbackRate = deckAPlaybackRate
        }
    } else {
        playerARef.current.stop()
    }
  }, [deckAPlaying, deckASource, deckAPlaybackRate])

  // Play/Stop B & Playback Rate
  useEffect(() => {
    if (!isSetup.current || !playerBRef.current) return
    
    if (deckBSource === 'local') {
        if (deckBPlaying && playerBRef.current.loaded) {
            if (playerBRef.current.state !== 'started') playerBRef.current.start()
        } else {
            playerBRef.current.stop()
        }
        if (playerBRef.current.playbackRate !== deckBPlaybackRate) {
            playerBRef.current.playbackRate = deckBPlaybackRate
        }
    } else {
        playerBRef.current.stop()
    }
  }, [deckBPlaying, deckBSource, deckBPlaybackRate])

  // Crossfader & Volume (Tone.js part)
  useEffect(() => {
    if (!gainARef.current || !gainBRef.current) return
    
    const volA = (deckASource === 'youtube' ? 0 : Math.cos((crossfader || 0.5) * 0.5 * Math.PI)) * (deckAVolume || 1)
    const volB = (deckBSource === 'youtube' ? 0 : Math.cos((1 - (crossfader || 0.5)) * 0.5 * Math.PI)) * (deckBVolume || 1)
    
    safeRampTo(gainARef.current.gain, volA, 0.05)
    safeRampTo(gainBRef.current.gain, volB, 0.05)
  }, [crossfader, deckAVolume, deckBVolume, deckASource, deckBSource])

  // Master Volume
  useEffect(() => {
    if (!masterGainRef.current) return
    safeRampTo(masterGainRef.current.gain, masterVolume || 0.8, 0.1)
  }, [masterVolume])

  // Spatial Panning
  useEffect(() => {
    if (!pannerARef.current || !pannerBRef.current) return
    
    // Find source positions
    const srcA = spatialSources.find(s => s.id === 'deckA')
    const srcB = spatialSources.find(s => s.id === 'deckB')
    
    // Map X position (-2 to 2) to Pan (-1 to 1)
    // Also use Z for volume attenuation (optional, simplified here)
    
    if (srcA) {
        const panA = Math.max(-1, Math.min(1, srcA.position[0] / 2))
        safeRampTo(pannerARef.current.pan, panA, 0.1)
    }
    if (srcB) {
        const panB = Math.max(-1, Math.min(1, srcB.position[0] / 2))
        safeRampTo(pannerBRef.current.pan, panB, 0.1)
    }
  }, [spatialSources])

  // EQ & Filter (Only affects Local tracks)
  useEffect(() => {
    if (!eqARef.current || !filterARef.current) return
    safeRampTo(eqARef.current.low, ((deckAEqLow ?? 0.5) - 0.5) * 24, 0.05)
    safeRampTo(eqARef.current.mid, ((deckAEqMid ?? 0.5) - 0.5) * 24, 0.05)
    safeRampTo(eqARef.current.high, ((deckAEqHigh ?? 0.5) - 0.5) * 24, 0.05)
    safeRampTo(filterARef.current.frequency, Math.pow(deckAFilter ?? 1, 3) * 20000 + 100, 0.05)
  }, [deckAEqLow, deckAEqMid, deckAEqHigh, deckAFilter])

  useEffect(() => {
    if (!eqBRef.current || !filterBRef.current) return
    safeRampTo(eqBRef.current.low, ((deckBEqLow ?? 0.5) - 0.5) * 24, 0.05)
    safeRampTo(eqBRef.current.mid, ((deckBEqMid ?? 0.5) - 0.5) * 24, 0.05)
    safeRampTo(eqBRef.current.high, ((deckBEqHigh ?? 0.5) - 0.5) * 24, 0.05)
    safeRampTo(filterBRef.current.frequency, Math.pow(deckBFilter ?? 1, 3) * 20000 + 100, 0.05)
  }, [deckBEqLow, deckBEqMid, deckBEqHigh, deckBFilter])

  // Effects (Only affects Local tracks)
  useEffect(() => {
    if (reverbARef.current) safeRampTo(reverbARef.current.wet, deckAReverb || 0, 0.1)
    if (delayARef.current) safeRampTo(delayARef.current.wet, deckADelay || 0, 0.1)
    if (distortionARef.current) {
      safeRampTo(distortionARef.current.wet, (deckADistortion || 0) > 0 ? 1 : 0, 0.1)
      distortionARef.current.distortion = deckADistortion || 0
    }
  }, [deckAReverb, deckADelay, deckADistortion])

  useEffect(() => {
    if (reverbBRef.current) safeRampTo(reverbBRef.current.wet, deckBReverb || 0, 0.1)
    if (delayBRef.current) safeRampTo(delayBRef.current.wet, deckBDelay || 0, 0.1)
    if (distortionBRef.current) {
      safeRampTo(distortionBRef.current.wet, (deckBDistortion || 0) > 0 ? 1 : 0, 0.1)
      distortionBRef.current.distortion = deckBDistortion || 0
    }
  }, [deckBReverb, deckBDelay, deckBDistortion])
}
