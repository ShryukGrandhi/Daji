# AIDA: AI DJ Assistant - XR Design Document

## 1. High-Level Concept
AIDA is an immersive XR DJ console designed to democratize DJing. It combines a modern, intuitive 3D interface with an AI Coach that guides users through voice commands and visual aids. The experience is built on the pillar of "unintimidating complexity"—hiding the scary parts of DJing while highlighting the fun, creative aspects.

## 2. Visual Style & Art Direction
*   **Aesthetic:** "Soft Sci-Fi" / Modern Premium. Not cyberpunk, not grunge. Think high-end consumer electronics meets futuristic holograms.
*   **Palette:**
    *   **Base:** Charcoal (`#1a1a1a`), Deep Navy (`#0f172a`).
    *   **Accents:** Electric Blue (`#3b82f6`) for active states, Teal (`#14b8a6`) for playback, Magenta (`#d946ef`) for FX.
    *   **Coach Mode:** Warm Cyan (`#06b6d4`) or Soft Gold (`#f59e0b`) to distinguish "help" from "function".
*   **Materials:** Matte finish for the console body to reduce glare. Glassmorphism for floating UI panels (track lists, coach bubbles). Metallic shaders for knobs/faders.
*   **Lighting:** Soft studio lighting. Key light from top-left. Rim lighting on controls to separate them from the dark chassis.

## 3. XR Layout & Spatial Organization
The user stands at a "console" floating at chest height (~1.1m).
*   **Zone 1: Deck A (Left)** - Player for Track 1.
*   **Zone 2: Mixer (Center)** - The heart of the console. Crossfader, EQs, Filter, Macros.
*   **Zone 3: Deck B (Right)** - Player for Track 2.
*   **Zone 4: Coach HUD (Top/Center)** - Floating holographic display for text feedback and voice confirmation.
*   **Zone 5: Track Crate (Right/Floating)** - A shelf of "vinyls" or track cards powered by web data.

## 4. Interactive Controls
### A. Decks (A & B)
*   **Platter:** Large circular touch zone. Rotating ring indicates playback. Tap to Play/Pause.
*   **Info Display:** Floating text just above the platter: Track Name, BPM, Key.

### B. Mixer (Center)
*   **Crossfader:** Horizontal slider. "Glows" when AI is moving it.
*   **EQ:** Two knobs (Low, High) per channel. Visual feedback: LED ring around the knob fills up.
*   **Filter:** Large knob at the top of the channel strip. Center detent (off). Left = Low Pass, Right = High Pass.

### C. Macros (AI Pads)
*   **Grid:** 2x2 buttons in the center.
*   **Labels:** "Transition", "Drop", "Build", "Loop".
*   **Action:** Trigger complex parameter automation (e.g., Filter Sweep + Reverb).

## 5. Voice Control UX
*   **Trigger:** Always listening (or push-to-talk).
*   **Visuals:** A waveform or "orb" acts as the AI avatar. It pulses when user speaks.
*   **Feedback:**
    1.  User speaks: "Fade to track B."
    2.  Text appears: *"Fading to Track B..."*
    3.  Controls animate: Crossfader moves right, EQ adjusts.
    4.  Coach explains: "Smoothing the transition by cutting bass on Deck A."

## 6. Coach Mode (Toggle)
*   **State OFF:** Clean interface. Standard DJ tool.
*   **State ON:**
    *   **Highlights:** Relevant knob glows when discussed.
    *   **Ghost Hands:** Shows "suggested" movement (e.g., ghost fader moving slowly).
    *   **Tooltips:** Gaze-dwell on a knob shows "High EQ: Controls treble sounds like hi-hats."

## 7. Tech Stack & Implementation Strategy
*   **Framework:** Next.js + React Three Fiber (WebXR).
*   **State:** Zustand (for syncing UI, Audio, and 3D Controls).
*   **Audio:** Web Audio API (Tone.js source nodes).
*   **Voice:** Web Speech API (SpeechRecognition).
*   **3D Assets:** Procedural geometry (Drei shapes) to keep it lightweight for the hackathon.



