# VibeFlow — Ambient Aesthetic To-Do & Focus Studio

<p align="center">
  <img src="https://img.shields.io/badge/Aesthetic-Vibe--Coded-ff2a85?style=for-the-badge" alt="Vibe Coded">
  <img src="https://img.shields.io/badge/Audio-Web%20Audio%20API-00f0ff?style=for-the-badge" alt="Web Audio API">
  <img src="https://img.shields.io/badge/Visuals-HTML5%20Canvas-2ec4b6?style=for-the-badge" alt="HTML5 Canvas">
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="MIT License">
</p>

**VibeFlow** is a modern productivity application built to turn everyday task management into an atmospheric, focused flow state. Featuring **5 dynamic vibe themes**, **procedural Web Audio ambient soundscapes**, **HTML5 canvas particle visualizers**, and an integrated **Pomodoro focus timer**.

---

## Key Features

### 1. Dynamic Vibe Themes
Switch between 5 tailored aesthetic environments with seamless CSS glassmorphism & canvas particle transitions:
- **Cyberpunk Synthwave**: Neon magenta & cyan gridlines with glowing elements.
- **Cozy Midnight Lo-Fi**: Warm amber fireplace glow with tranquil rain mood.
- **Tranquil Zen Garden**: Emerald & sage green gradients with floating leaf particles.
- **Deep Cosmic Void**: Deep space obsidian blue with a twinkling starfield canvas.
- **Y2K Vaporwave Dreams**: Pastel wave gradients with retro chrome accents.

### 2. Procedural Web Audio Sound Engine
Zero external audio files or MP3 downloads required! Audio is dynamically synthesized in real-time using the browser's native **Web Audio API**:
- **Gentle Rain**: Procedurally filtered white noise with randomized raindrop pops.
- **Cozy Fireplace**: Warm brown noise with crackling flame simulation.
- **Synth Pad Drone**: Dual harmonic oscillator ambient soundscape.
- **Alpha Binaural Tone**: 10Hz differential isochronic beats for deep focus.
- **Task Completion Chime**: Ascending 4-note synth chord chime.

### 3. Gamified Task Management
- **Priorities**: Chill, Focus, Rush.
- **Categories**: Work, Creative, Personal, Study.
- **Subtasks Breakdown**: Modal checklist for dividing complex projects into steps.
- **Celebration Burst**: Dynamic particle confetti explosion upon completing tasks.
- **Productivity Stats**: Active streak counter, total focus minutes logged, and daily flow level meter.

### 4. Integrated Pomodoro Timer
- Presets for **Focus (25m)**, **Short Break (5m)**, and **Long Break (15m)**.
- Audio finish alerts and automatic focus session logging to your streak statistics.

---

## File Architecture

```
vibe-todo-app/
├── index.html        # App layout, semantic structure & glassmorphism panels
├── css/
│   └── style.css     # CSS custom variables, dynamic theme engine & keyframes
└── js/
    ├── app.js        # Main entry point connecting UI events, audio & timer
    ├── audio.js      # Procedural Web Audio API soundscape synthesizer
    ├── particles.js  # HTML5 Canvas background particle & confetti engine
    ├── storage.js    # LocalStorage persistence manager (tasks, stats, theme)
    └── timer.js      # Pomodoro focus timer state machine
```

---

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NadirAliOfficial/vibe-todo-app.git
   cd vibe-todo-app
   ```

2. **Run locally**:
   Serve `index.html` using any local HTTP server:
   ```bash
   python3 -m http.server 8085
   ```
   or open `index.html` directly in your browser.

3. **Access in browser**:
   Navigate to `http://localhost:8085`.

---

## License
Distributed under the **MIT License**.
