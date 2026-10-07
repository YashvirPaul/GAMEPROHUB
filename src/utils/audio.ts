// Web Audio API Synthesizer for tactile game feedback

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gamehub_sound_enabled');
      this.soundEnabled = saved !== null ? saved === 'true' : true;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isMuted(): boolean {
    return !this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gamehub_sound_enabled', String(enabled));
    }
  }

  public toggleSound(): boolean {
    this.setSoundEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  public playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.1, gainValue: number = 0.15) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy or device fallback
    }
  }

  public playClick() {
    this.playTone(600, 'triangle', 0.04, 0.08);
  }

  public playSuccess() {
    if (!this.soundEnabled) return;
    this.playTone(587.33, 'sine', 0.08, 0.12);
    setTimeout(() => this.playTone(880, 'sine', 0.14, 0.15), 70);
  }

  public playError() {
    if (!this.soundEnabled) return;
    this.playTone(220, 'sawtooth', 0.12, 0.12);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.16, 0.14), 80);
  }

  public playGameWin() {
    if (!this.soundEnabled) return;
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.16, 0.14), idx * 80);
    });
  }

  public playScore() {
    if (!this.soundEnabled) return;
    this.playTone(523.25, 'sine', 0.08, 0.12);
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.15), 60);
  }

  public playCoin() {
    if (!this.soundEnabled) return;
    this.playTone(987.77, 'sine', 0.08, 0.12);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.14, 0.15), 70);
  }

  public playJump() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Audio context ignore
    }
  }

  public playLaser() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // Audio context ignore
    }
  }

  public playExplosion() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch {
      // Audio context ignore
    }
  }

  public playGameOver() {
    if (!this.soundEnabled) return;
    this.playTone(330, 'sawtooth', 0.15, 0.12);
    setTimeout(() => this.playTone(277, 'sawtooth', 0.15, 0.12), 120);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.28, 0.15), 240);
  }

  public playVictory() {
    if (!this.soundEnabled) return;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.15, 0.15), idx * 90);
    });
  }
}

export const soundFx = new SoundEffectsManager();
