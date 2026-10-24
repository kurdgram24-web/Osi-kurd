/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Audio feedback synthesizer using Web Audio API
class SoundManager {
  private ctx: AudioContext | null = null;
  private isSoundEnabled = true;
  private isHapticsEnabled = true;

  constructor() {
    // Check saved preferences
    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem('osi_calc_sound');
      if (savedSound !== null) {
        this.isSoundEnabled = savedSound === 'true';
      }
      const savedHaptics = localStorage.getItem('osi_calc_haptics');
      if (savedHaptics !== null) {
        this.isHapticsEnabled = savedHaptics === 'true';
      }
    }
  }

  private initContext() {
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

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('osi_calc_sound', enabled ? 'true' : 'false');
    }
  }

  public getHapticsEnabled(): boolean {
    return this.isHapticsEnabled;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.isHapticsEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('osi_calc_haptics', enabled ? 'true' : 'false');
    }
  }

  public playDigit() {
    this.playTone(320, 0.04, 'sine', 0.12);
    this.vibrate(6);
  }

  public playOperator() {
    this.playTone(480, 0.05, 'triangle', 0.14);
    this.vibrate(10);
  }

  public playFunction() {
    this.playTone(560, 0.05, 'sine', 0.14);
    this.vibrate(8);
  }

  public playEquals() {
    this.playChord([523.25, 659.25, 783.99], 0.12); // C5 major
    this.vibrate(15);
  }

  public playClear() {
    this.playTone(220, 0.07, 'sawtooth', 0.1);
    this.vibrate(12);
  }

  public playDelete() {
    this.playTone(280, 0.04, 'triangle', 0.1);
    this.vibrate(8);
  }

  public playError() {
    this.playTone(160, 0.14, 'sawtooth', 0.18);
    this.vibrate([20, 40, 20]);
  }

  private vibrate(pattern: number | number[]) {
    if (!this.isHapticsEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if not permitted
      }
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.1) {
    if (!this.isSoundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay or permission restriction
    }
  }

  private playChord(freqs: number[], duration: number) {
    if (!this.isSoundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.02);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.02);
        osc.stop(this.ctx.currentTime + duration);
      });
    } catch {
      // Audio autoplay restriction
    }
  }
}

export const soundManager = new SoundManager();
