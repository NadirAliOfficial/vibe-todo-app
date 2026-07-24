/* VibeFlow - Web Audio API Sound Generator */

class VibeAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.tracks = {
      rain: { active: false, gain: null, node: null, volume: 0.5 },
      fireplace: { active: false, gain: null, node: null, volume: 0.4 },
      synthPad: { active: false, gain: null, node: null, volume: 0.3 },
      binaural: { active: false, gain: null, node: null, volume: 0.3 }
    };
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.ctx.destination);

    this.initialized = true;
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /* Task Completion Sound Effect */
  playCompletionChime() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 synth chime

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.25, now + index * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.85);
    });
  }

  /* Timer Finished Sound Effect */
  playTimerEndSound() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    chord.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.1);
    });
  }

  /* Ambient Rain Synthesizer */
  createRainNode() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter white noise to sound like gentle rain
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    return { source: noise, output: filter };
  }

  /* Ambient Fireplace Synthesizer */
  createFireplaceNode() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02; // Brown noise approximation
      lastOut = data[i];
      data[i] *= 3.5; // Gain boost
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    noise.connect(filter);
    return { source: noise, output: filter };
  }

  /* Ambient Lo-Fi Synth Drone */
  createSynthPadNode() {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sine';
    osc1.frequency.value = 110; // A2
    osc2.frequency.value = 164.81; // E3

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 250;

    osc1.connect(filter);
    osc2.connect(filter);

    return { 
      source: { start: () => { osc1.start(); osc2.start(); }, stop: () => { osc1.stop(); osc2.stop(); } }, 
      output: filter 
    };
  }

  /* Ambient Binaural Beats (10Hz Alpha Focus) */
  createBinauralNode() {
    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();
    
    oscLeft.frequency.value = 200;
    oscRight.frequency.value = 210; // 10Hz differential for alpha focus

    const merger = this.ctx.createChannelMerger(2);
    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);

    return {
      source: { start: () => { oscLeft.start(); oscRight.start(); }, stop: () => { oscLeft.stop(); oscRight.stop(); } },
      output: merger
    };
  }

  toggleTrack(trackName, state) {
    this.ensureContext();
    if (!this.ctx || !this.tracks[trackName]) return;

    const track = this.tracks[trackName];

    if (state && !track.active) {
      track.gain = this.ctx.createGain();
      track.gain.gain.value = track.volume;

      let synth;
      if (trackName === 'rain') synth = this.createRainNode();
      else if (trackName === 'fireplace') synth = this.createFireplaceNode();
      else if (trackName === 'synthPad') synth = this.createSynthPadNode();
      else if (trackName === 'binaural') synth = this.createBinauralNode();

      synth.output.connect(track.gain);
      track.gain.connect(this.masterGain);
      synth.source.start();

      track.node = synth.source;
      track.active = true;
    } else if (!state && track.active) {
      if (track.node) {
        try { track.node.stop(); } catch (e) {}
      }
      track.active = false;
    }
  }

  setVolume(trackName, volume) {
    if (this.tracks[trackName]) {
      this.tracks[trackName].volume = volume;
      if (this.tracks[trackName].gain && this.ctx) {
        this.tracks[trackName].gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      }
    }
  }
}

export const vibeAudio = new VibeAudioEngine();
