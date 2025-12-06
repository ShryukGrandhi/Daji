import { useState, useCallback, useRef } from 'react'
import { useDJStore } from '@/store/useDJStore'

export function useVoiceControl() {
  const [isListening, setIsListening] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const isStoppingRef = useRef(false)
  
  const setCoachMessage = useDJStore((s) => s.setCoachMessage)
  const setAgentThought = useDJStore((s) => s.setAgentThought)
  const updateDeck = useDJStore((s) => s.updateDeck)
  const setCrossfader = useDJStore((s) => s.setCrossfader)
  const addToHistory = useDJStore((s) => s.addToHistory)

  const executeAction = useCallback((action: string, params: any) => {
    console.log("⚡ Executing:", action, params)
    
    switch (action) {
      case 'LOAD_TRACK':
        const deck = params.deck as 'A' | 'B'
        updateDeck(deck, {
          track: params.title,
          url: params.url,
          bpm: params.bpm || 128,
          playing: params.autoPlay !== false,
          startPosition: params.position || 0,
        })
        if (params.title && params.url) {
          addToHistory({ title: params.title, url: params.url })
        }
        break
        
      case 'PLAY':
        updateDeck(params.deck as 'A' | 'B', { playing: true })
        break
        
      case 'STOP':
        updateDeck(params.deck as 'A' | 'B', { playing: false })
        break
        
      case 'CROSSFADE':
        setCrossfader(params.value)
        break
        
      case 'SET_VOLUME':
        updateDeck(params.deck as 'A' | 'B', { volume: params.value })
        break
        
      case 'SET_EQ':
        const eqDeck = params.deck as 'A' | 'B'
        const currentEq = useDJStore.getState()[eqDeck === 'A' ? 'deckA' : 'deckB'].eq
        updateDeck(eqDeck, {
          eq: {
            low: params.low ?? currentEq.low,
            mid: params.mid ?? currentEq.mid,
            high: params.high ?? currentEq.high,
          }
        })
        break
        
      case 'SET_FILTER':
        updateDeck(params.deck as 'A' | 'B', { filter: params.value })
        break
        
      case 'SET_POSITION':
        updateDeck(params.deck as 'A' | 'B', { startPosition: params.value })
        break
        
      case 'SET_BPM':
        updateDeck(params.deck as 'A' | 'B', { bpm: params.value })
        break
        
      case 'SET_EFFECT':
        const effectDeck = params.deck as 'A' | 'B'
        const effect = params.effect as 'reverb' | 'delay' | 'distortion'
        updateDeck(effectDeck, { [effect]: params.value })
        break
        
      case 'BEAT_DROP':
        // Execute beat drop sequence
        if (params.sequence) {
          params.sequence.forEach((step: any, i: number) => {
            setTimeout(() => {
              executeAction(step.action, step)
            }, i * 200) // Stagger actions
          })
        }
        break
        
      case 'MULTI':
        if (params.actions) {
          params.actions.forEach((a: any, i: number) => {
            setTimeout(() => {
              executeAction(a.action, a.params || a)
            }, i * 100)
          })
        }
        break
    }
  }, [updateDeck, setCrossfader, addToHistory])

  const processCommand = useCallback(async (text: string) => {
    if (!text.trim()) return
    
    console.log("🎤 Heard:", text)
    setTranscript(text)
    setCoachMessage(`Processing: "${text}"`)
    setAgentThought("Thinking...")

    try {
      const state = useDJStore.getState()
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          djState: {
            deckA: state.deckA,
            deckB: state.deckB,
            crossfader: state.crossfader,
          }
        })
      })

      const result = await response.json()
      console.log("🤖 Response:", result)

      if (result.thought) setAgentThought(result.thought)
      if (result.speech) setCoachMessage(result.speech)

      // Execute the action
      if (result.action && result.action !== 'EXPLAIN') {
        executeAction(result.action, result.parameters || {})
      }

    } catch (e) {
      console.error("Error:", e)
      setCoachMessage("Try: 'play world burn on A'")
      setAgentThought("Error")
    }
  }, [setCoachMessage, setAgentThought, executeAction])

  const startListening = useCallback(async () => {
    if (isListening || recognitionRef.current) return
    isStoppingRef.current = false

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setCoachMessage("Voice not supported")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
    } catch {
      setPermissionDenied(true)
      setCoachMessage("Mic access denied")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setCoachMessage("🎤 Listening...")
    }

    recognition.onend = () => {
      if (!isStoppingRef.current && recognitionRef.current) {
        try { recognition.start() } catch {}
      } else {
        setIsListening(false)
        recognitionRef.current = null
      }
    }

    recognition.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        setPermissionDenied(true)
        setCoachMessage("Mic blocked")
        stopListening()
      }
    }

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const text = event.results[last][0].transcript.trim()
      if (text) processCommand(text)
    }

    recognitionRef.current = recognition
    try { recognition.start() } catch { recognitionRef.current = null }
  }, [isListening, processCommand, setCoachMessage])

  const stopListening = useCallback(() => {
    isStoppingRef.current = true
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    setIsListening(false)
    setCoachMessage("🔇 Mic off")
  }, [setCoachMessage])

  const toggleListening = useCallback(() => {
    if (isListening) stopListening()
    else startListening()
  }, [isListening, startListening, stopListening])

  return { 
    isListening, 
    permissionDenied,
    transcript,
    toggleListening,
    startListening,
    stopListening,
    handleCommand: processCommand // Export this for manual triggers
  }
}
