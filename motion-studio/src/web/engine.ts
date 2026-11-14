import gsap from "gsap";
import { SCENES } from "../core/storyboard";
import { STAGE } from "../core/tokens";

/**
 * WEB ENGINE — a single paused GSAP timeline is the film's clock.
 * It tweens one number (the frame) from 0 → durationInFrames; every scene reads it
 * through the platform bridge. Play, scrub and chapter jumps are all timeline
 * operations, and the audio is slaved to the same playhead. No setTimeout anywhere.
 */
type Listener = () => void;

const DURATION = STAGE.durationInFrames / STAGE.fps;
const state = { frame: 0 };
let playing = false;
let sfxOn = true;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

let vo: HTMLAudioElement | null = null;
let sfx: HTMLAudioElement | null = null;

const timeline = gsap.timeline({
  paused: true,
  onUpdate: emit,
  onComplete: () => {
    playing = false;
    vo?.pause();
    sfx?.pause();
    emit();
  },
});
timeline.to(state, { frame: STAGE.durationInFrames, duration: DURATION, ease: "none" });
SCENES.forEach((s) => timeline.addLabel(s.id, s.start));

const audioTime = (a: HTMLAudioElement, t: number) => Math.min(t, Math.max(0, (a.duration || DURATION) - 0.02));

/** keep the audio locked to the timeline (and not the other way round) */
const syncAudio = (hard = false) => {
  const t = timeline.time();
  for (const a of [vo, sfx]) {
    if (!a) continue;
    const past = t >= (a.duration || DURATION) - 0.03;
    if (hard || Math.abs(a.currentTime - t) > 0.12) a.currentTime = audioTime(a, t);
    if (playing && !past && a.paused) void a.play().catch(() => undefined);
    if ((!playing || past) && !a.paused) a.pause();
  }
};
gsap.ticker.add(() => {
  if (playing) syncAudio();
});

export const engine = {
  duration: DURATION,
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** fractional frame — smoother than 30fps on fast displays, still deterministic */
  getFrame: () => state.frame,
  getTime: () => timeline.time(),
  isPlaying: () => playing,
  isSfxOn: () => sfxOn,
  attachAudio: (voEl: HTMLAudioElement, sfxEl: HTMLAudioElement) => {
    vo = voEl;
    sfx = sfxEl;
    sfx.volume = 0.9;
    sfx.muted = !sfxOn;
  },
  play: () => {
    if (timeline.progress() >= 1) timeline.time(0);
    playing = true;
    timeline.play();
    syncAudio(true);
    emit();
  },
  pause: () => {
    playing = false;
    timeline.pause();
    syncAudio();
    emit();
  },
  toggle: () => (playing ? engine.pause() : engine.play()),
  seek: (seconds: number) => {
    timeline.time(Math.min(DURATION, Math.max(0, seconds)));
    syncAudio(true);
    emit();
  },
  seekScene: (id: string) => {
    timeline.seek(id);
    syncAudio(true);
    emit();
  },
  setSfx: (on: boolean) => {
    sfxOn = on;
    if (sfx) sfx.muted = !on;
    emit();
  },
};

// handy for QA / automated checks
(window as unknown as { __film: typeof engine }).__film = engine;
