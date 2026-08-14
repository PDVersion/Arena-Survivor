import type { FeedbackCategory } from "../../core/archetypes/categories";
import type { ThemeTokens } from "../../core/archetypes/contracts";

export class FeedbackLimiter {
  private activeVisuals = 0;
  private visualHighWater = 0;
  private dropped = 0;
  private readonly lastAudioAt = new Map<FeedbackCategory, number>();

  constructor(
    private readonly maxVisuals = 48,
    private readonly audioCooldownMs = 45,
  ) {}

  beginVisual(): boolean {
    if (this.activeVisuals >= this.maxVisuals) {
      this.dropped += 1;
      return false;
    }
    this.activeVisuals += 1;
    this.visualHighWater = Math.max(this.visualHighWater, this.activeVisuals);
    return true;
  }

  endVisual(): void {
    this.activeVisuals = Math.max(0, this.activeVisuals - 1);
  }

  clearVisuals(): void {
    this.activeVisuals = 0;
  }

  allowAudio(category: FeedbackCategory, nowMs: number): boolean {
    const last = this.lastAudioAt.get(category) ?? Number.NEGATIVE_INFINITY;
    if (nowMs < last + this.audioCooldownMs) {
      this.dropped += 1;
      return false;
    }
    this.lastAudioAt.set(category, nowMs);
    return true;
  }

  snapshot(): Readonly<{ activeVisuals: number; visualHighWater: number; dropped: number }> {
    return Object.freeze({ activeVisuals: this.activeVisuals, visualHighWater: this.visualHighWater, dropped: this.dropped });
  }
}

export class AudioFeedbackService {
  private context?: AudioContext;
  private unlocked = false;
  private muted = false;
  private focused = true;
  private voices = 0;
  private emitted = 0;

  constructor(private readonly sounds: ThemeTokens["sounds"], private readonly maxVoices = 8) {}

  unlock(): void {
    if (this.unlocked) return;
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) return;
    this.context = new AudioContextConstructor();
    this.unlocked = true;
  }

  setMuted(muted: boolean): void { this.muted = muted; }
  toggleMuted(): void { this.muted = !this.muted; }
  setFocused(focused: boolean): void { this.focused = focused; }

  play(category: FeedbackCategory): boolean {
    if (!this.context || !this.unlocked || this.muted || !this.focused || this.voices >= this.maxVoices) return false;
    const sound = this.sounds[category];
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.frequency.value = sound.frequency;
    gain.gain.value = sound.gain;
    oscillator.connect(gain).connect(this.context.destination);
    const endAt = this.context.currentTime + sound.durationMs / 1000;
    oscillator.start();
    oscillator.stop(endAt);
    this.voices += 1;
    this.emitted += 1;
    oscillator.addEventListener("ended", () => { this.voices = Math.max(0, this.voices - 1); });
    return true;
  }

  destroy(): void {
    void this.context?.close();
    this.context = undefined;
    this.voices = 0;
    this.unlocked = false;
  }

  snapshot(): Readonly<{ unlocked: boolean; muted: boolean; focused: boolean; voices: number; emitted: number }> {
    return Object.freeze({ unlocked: this.unlocked, muted: this.muted, focused: this.focused, voices: this.voices, emitted: this.emitted });
  }
}
