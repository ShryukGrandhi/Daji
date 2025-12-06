import { useEffect, useState } from 'react'
import { useDJStore } from '@/store/useDJStore'

export function useVoiceControl() {
  const [isListening, setIsListening] = useState(false)
  const { 
    updateDeck, 
    setCrossfader, 
    toggleCoachMode, 
    setCoachMessage, 
    setSuggestedTracks,
    coachMode,
    crossfader
  } = useDJStore()

  useEffect(() => {
    // @ts-ignore - Web Speech API types might be missing in standard TS lib
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.")
      setCoachMessage("Voice control not supported on this device.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()
      console.log("Voice Command:", transcript)
      
      handleCommand(transcript)
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [])

  const handleCommand = (cmd: string) => {
    // Basic Intent Matching
    
    // COACH MODE
    if (cmd.includes("coach") || cmd.includes("help")) {
      toggleCoachMode()
      setCoachMessage(coachMode ? "Coach Mode Off." : "Coach Mode Active. I'm listening.")
      return
    }

    // PLAYBACK
    if (cmd.includes("play") || cmd.includes("start")) {
      if (cmd.includes("left") || cmd.includes("track a")) {
          updateDeck('A', { playing: true })
          setCoachMessage("Playing Track A.")
      } else if (cmd.includes("right") || cmd.includes("track b")) {
          updateDeck('B', { playing: true })
          setCoachMessage("Playing Track B.")
      } else {
          // Default to both or main
          updateDeck('A', { playing: true })
          setCoachMessage("Starting playback.")
      }
    }

    if (cmd.includes("stop") || cmd.includes("pause")) {
       updateDeck('A', { playing: false })
       updateDeck('B', { playing: false })
       setCoachMessage("Stopping all decks.")
    }

    // CROSSFADER / TRANSITION
    if (cmd.includes("fade") || cmd.includes("transition") || cmd.includes("mix")) {
       if (cmd.includes("right") || cmd.includes("b")) {
           setCrossfader(1)
           setCoachMessage("Transitioning to Deck B.")
       } else if (cmd.includes("left") || cmd.includes("a")) {
           setCrossfader(0)
           setCoachMessage("Transitioning to Deck A.")
       } else {
           // Go to center
           setCrossfader(0.5)
           setCoachMessage("Moving crossfader to center.")
       }
    }
    
    // BASS / EQ
    if (cmd.includes("bass") || cmd.includes("low")) {
        if (cmd.includes("cut") || cmd.includes("lower") || cmd.includes("kill")) {
            setCoachMessage("Cutting the bass frequencies.")
            // Visual only for now - logic would go to deck state
        }
    }

    // TRACK DISCOVERY (Apify Mock)
    if (cmd.includes("find") || cmd.includes("suggest") || cmd.includes("track")) {
        if (cmd.includes("easy") || cmd.includes("beginner")) {
            setCoachMessage("Finding beginner-friendly tracks around 120 BPM...")
            setTimeout(() => {
                setSuggestedTracks([
                    { id: '1', title: 'Basic Beat 01', bpm: 120, mood: 'Energetic' },
                    { id: '2', title: 'Vocal Chops', bpm: 122, mood: 'Chill' }
                ])
                setCoachMessage("Here are two easy tracks. Try loading one.")
            }, 1000)
        }
    }
  }

  return { isListening }
}

