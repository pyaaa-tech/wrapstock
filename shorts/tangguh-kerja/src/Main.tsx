import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, CX, DURATION } from "./theme";
import { HITS, S } from "./cues";
import { clamp01, easeInCubic, easeInOutCubic, easeOutCubic, shake } from "./lib/anim";
import { SceneProps } from "./components/Shell";
import { Captions } from "./components/Captions";
import { Overlays } from "./components/Fx";
import { S1Deadline } from "./scenes/S1Deadline";
import { S2Mengemas } from "./scenes/S2Mengemas";
import { S3aBukanMalas } from "./scenes/S3aBukanMalas";
import { S3bKajian } from "./scenes/S3bKajian";
import { S3cMood } from "./scenes/S3cMood";
import { S4Snowball } from "./scenes/S4Snowball";
import { S5SeeSaw } from "./scenes/S5SeeSaw";
import { S5bMulaKecil } from "./scenes/S5bMulaKecil";
import { S6Timer } from "./scenes/S6Timer";
import { S7Komen } from "./scenes/S7Komen";

type Tr = "whip" | "zoom" | "match" | "smash";
type SceneDef = {
  id: string;
  start: number;
  Comp: React.FC<SceneProps>;
  /** transition INTO this scene, landing exactly on `start` (a voice onset) */
  tr: Tr;
  dir?: 1 | -1;
  /** zoom: focal point in the OUTGOING scene, and in the incoming one */
  zoomFrom?: [number, number];
  zoomTo?: [number, number];
};

export const SCENES: SceneDef[] = [
  { id: "s1", start: S.s1, Comp: S1Deadline, tr: "whip", dir: 1 },
  { id: "s2", start: S.s2, Comp: S2Mengemas, tr: "whip", dir: 1 },
  { id: "s3a", start: S.s3a, Comp: S3aBukanMalas, tr: "match" },
  { id: "s3b", start: S.s3b, Comp: S3bKajian, tr: "zoom", zoomFrom: [CX, 840], zoomTo: [CX, 900] },
  { id: "s3c", start: S.s3c, Comp: S3cMood, tr: "whip", dir: -1 },
  { id: "s4", start: S.s4, Comp: S4Snowball, tr: "whip", dir: 1 },
  { id: "s5", start: S.s5, Comp: S5SeeSaw, tr: "zoom", zoomFrom: [370, 900], zoomTo: [CX, 700] },
  { id: "s5b", start: S.s5b, Comp: S5bMulaKecil, tr: "smash" },
  { id: "s6", start: S.s6, Comp: S6Timer, tr: "zoom", zoomFrom: [290, 900], zoomTo: [CX, 430] },
  { id: "s7", start: S.s7, Comp: S7Komen, tr: "whip", dir: -1 },
];

const WHIP = 8; // frames, ends on the onset
const WHIP_DIST = 1240;
const ZOOM_OUT = 5; // frames before the onset
const ZOOM_IN = 7; // frames after the onset

const whipP = (fl: number, start: number) => easeInOutCubic(clamp01((fl - (start - WHIP - 1)) / (WHIP + 1)));

type Xf = { x: number; scale: number; origin: [number, number]; blurX: number; blur: number };
const ID: Xf = { x: 0, scale: 1, origin: [540, 960], blurX: 0, blur: 0 };

/** Transform of scene i at (scene-local timeline) frame fl. */
const transformFor = (i: number, fl: number, next: SceneDef | undefined, nextStart: number): Xf => {
  const s = SCENES[i];
  let xf: Xf = { ...ID };
  // incoming
  if (s.tr === "whip" && fl < s.start) {
    const p = whipP(fl, s.start);
    const p0 = whipP(fl - 1, s.start);
    const dir = s.dir ?? 1;
    xf = { ...xf, x: dir * (1 - p) * WHIP_DIST, blurX: Math.min(70, Math.abs(p - p0) * WHIP_DIST * 0.22) };
  } else if (s.tr === "zoom" && fl >= s.start && fl < s.start + ZOOM_IN) {
    const v = easeOutCubic(clamp01((fl - s.start + 1) / ZOOM_IN));
    xf = { ...xf, scale: 1 + 1.1 * (1 - v), blur: 12 * (1 - v), origin: s.zoomTo ?? [540, 960] };
  } else if (s.tr === "smash" && fl >= s.start && fl < s.start + 14) {
    const d = fl - s.start;
    // decaying bounce that never dips below 1 (no borders)
    xf = { ...xf, scale: 1 + 0.32 * Math.exp(-d * 0.38) * Math.abs(Math.cos(d * 0.5)), origin: [CX, 900] };
  } else if (s.tr === "match" && fl >= s.start && fl < s.start + 6) {
    xf = { ...xf, scale: 1.07 - 0.07 * easeOutCubic(clamp01((fl - s.start) / 5)), origin: [CX, 900] };
  }
  // outgoing (into next)
  if (next) {
    if (next.tr === "whip" && fl >= nextStart - WHIP && fl < nextStart) {
      const p = whipP(fl, nextStart);
      const p0 = whipP(fl - 1, nextStart);
      const dir = next.dir ?? 1;
      xf = { ...xf, x: -dir * p * WHIP_DIST, blurX: Math.min(70, Math.abs(p - p0) * WHIP_DIST * 0.22) };
    } else if (next.tr === "zoom" && fl >= nextStart - ZOOM_OUT && fl < nextStart) {
      const u = easeInCubic(clamp01((fl - (nextStart - ZOOM_OUT) + 1) / ZOOM_OUT));
      xf = { ...xf, scale: 1 + 3.2 * u, blur: 16 * u, origin: next.zoomFrom ?? [540, 960] };
    }
  }
  return xf;
};

const SceneLayer: React.FC<{ id: string; xf: Xf; children: React.ReactNode }> = ({ id, xf, children }) => {
  const filterId = `mb-${id}`;
  const filters: string[] = [];
  if (xf.blurX > 0.5) filters.push(`url(#${filterId})`);
  if (xf.blur > 0.3) filters.push(`blur(${xf.blur.toFixed(2)}px)`);
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${xf.x}px) scale(${xf.scale})`,
        transformOrigin: `${xf.origin[0]}px ${xf.origin[1]}px`,
        filter: filters.length ? filters.join(" ") : undefined,
      }}
    >
      {xf.blurX > 0.5 ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId} x="-30%" y="0%" width="160%" height="100%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation={`${xf.blurX.toFixed(2)} 0`} edgeMode="duplicate" />
            </filter>
          </defs>
        </svg>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const layers: React.ReactNode[] = [];

  SCENES.forEach((s, i) => {
    const next = SCENES[i + 1];
    const nextStart = next ? next.start : DURATION;
    const visStart = s.tr === "whip" ? s.start - WHIP : s.start;
    if (f >= visStart && f < nextStart) {
      // last scene whips out into the loop copy of scene 1
      const nxt = next ?? { ...SCENES[0], start: DURATION };
      const xf = transformFor(i, f, nxt, nextStart);
      layers.push(
        <SceneLayer key={s.id} id={s.id} xf={xf}>
          <s.Comp f={f} cam={xf.x} />
        </SceneLayer>,
      );
    }
  });
  // Seamless loop: scene 1 whips in over the last frames, continuing into frame 0.
  if (f >= DURATION - WHIP) {
    const fl = f - DURATION;
    const xf = transformFor(0, fl, SCENES[1], SCENES[1].start);
    layers.push(
      <SceneLayer key="s1-loop" id="s1loop" xf={xf}>
        <S1Deadline f={fl} cam={xf.x} />
      </SceneLayer>,
    );
  }

  const sh = shake(f, HITS, 20, 6);
  const smash = SCENES.find((s) => s.tr === "smash")!;
  const flash = f >= smash.start && f < smash.start + 2 ? (f === smash.start ? 0.85 : 0.35) : 0;

  return (
    <AbsoluteFill style={{ background: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + (sh.x || sh.y ? 0.05 : 0)})` }}>
        {layers}
      </AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{ background: C.white, opacity: flash }} /> : null}
      <Captions f={f} />
      <Overlays f={f} />
      {/* voice + music + SFX, built by scripts/make_audio.py (raw voice: audio/vo.mp3) */}
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
