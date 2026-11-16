import React from "react";
import { AbsoluteFill, Img, spring, staticFile } from "remotion";
import { C, CX } from "../theme";
import { S } from "../cues";
import { clamp01 } from "../lib/anim";
import { Decor, SceneProps } from "../components/Shell";

/** Brand pink, as measured from the logo file. Used only for the flat sparkles. */
export const BRAND_PINK = "#EF85A0";

// Logo PNG: 938 x 487, visible artwork spans x 23-914, y 24-463 (892 px wide).
const LOGO_W = 938;
const LOGO_H = 487;
const VISIBLE_W = 892;
const TARGET_W = 880; // visible logo width on screen (~80% of 1080)
const SCALE = TARGET_W / VISIBLE_W;
const DRAW_W = LOGO_W * SCALE;
const DRAW_H = LOGO_H * SCALE;
// Centre of the visible artwork in the PNG (used as the pop pivot).
const ART_CX = (23 + 914) / 2;
const ART_CY = (24 + 463) / 2;
// Centred in the safe area (right 12% kept clear): rests at x 67-946, y 684-1117.
export const LOGO_CENTER: [number, number] = [CX, 900];

/** Background of the outro: the video's cream + subtle dot pattern. Travels with the whip-pan. */
export const OutroBackground: React.FC<SceneProps> = ({ f, cam }) => (
  <AbsoluteFill style={{ background: C.cream, overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `translateX(${-cam * 0.45}px)` }}>
      <Decor seed="outro" f={f} kind="dots" colors={[C.pink]} opacity={0.3} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/** Spring tuned so the scale goes 0.3 -> 1.08 (frame 7) -> 1.0. */
const popSpring = (d: number) => spring({ frame: d, fps: 30, config: { damping: 17.5, stiffness: 240, mass: 1 } });

const sparkle = (r: number) => {
  const k = r * 0.13;
  return `M 0 ${-r} Q ${k} ${-k} ${r} 0 Q ${k} ${k} 0 ${r} Q ${-k} ${k} ${-r} 0 Q ${-k} ${-k} 0 ${-r} Z`;
};

// Six flat pink sparkles, clockwise from top-left, all inside the safe zone and clear of the logo's own stars.
const SPARKLES: { x: number; y: number; r: number; delay: number }[] = [
  { x: 118, y: 712, r: 26, delay: 6 },
  { x: 588, y: 664, r: 22, delay: 9 },
  { x: 926, y: 738, r: 20, delay: 12 },
  { x: 914, y: 1092, r: 18, delay: 15 },
  { x: 236, y: 1122, r: 24, delay: 18 },
  { x: 62, y: 866, r: 16, delay: 21 },
];
const TWINKLE = 10; // frames per sparkle

/**
 * The logo itself and its sparkles. Rendered above the paper/grain overlays so the logo artwork is shown
 * exactly as supplied (no recolouring or texturing).
 */
export const OutroBrand: React.FC<{ f: number }> = ({ f }) => {
  const d = f - S.outro;
  if (d < 0) return null;
  const sp = popSpring(d);
  const scale = 0.3 + 0.7 * sp;
  const rot = -9 * (1 - sp);
  const left = LOGO_CENTER[0] - ART_CX * SCALE;
  const top = LOGO_CENTER[1] - ART_CY * SCALE;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img
        src={staticFile("brand/soyaa-soy-logo.png")}
        style={{
          position: "absolute",
          left,
          top,
          width: DRAW_W,
          height: DRAW_H,
          transformOrigin: `${ART_CX * SCALE}px ${ART_CY * SCALE}px`,
          transform: `rotate(${rot}deg) scale(${scale})`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {SPARKLES.map((s, i) => {
          const t = d - s.delay;
          if (t < 0 || t > TWINKLE) return null;
          const u = t / TWINKLE;
          // quick pop up with a little overshoot, then shrink away
          const grow = clamp01(t / 3);
          const sc = t < 3 ? grow * (1 + 0.25 * Math.sin(grow * Math.PI)) : 1 - Math.pow(clamp01((t - 3) / (TWINKLE - 3)), 1.6);
          return (
            <path key={i} d={sparkle(s.r)} transform={`translate(${s.x} ${s.y}) rotate(${-20 + 45 * u}) scale(${Math.max(0, sc)})`} fill={BRAND_PINK} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
