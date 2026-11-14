import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";
import { FPS, f } from "../geometry";
import { C, SANS, rgba, serifDisplay } from "../theme";
import {
  ALL_DONE,
  RAIL_IN,
  SCENES,
  STEPS,
  TITLES,
  sceneIndexAt,
  segAt,
} from "../timeline";

const RAIL_X = 96;
const NODE_Y = (i: number) => 172 + i * 70;
const DOT = 16;
const BADGE = 84;
const STEP_SPRING = { damping: 14, stiffness: 120 };

/** Rel langkah: 6 titik dihubung garis emas halus; titik semasa mengembang jadi lencana bernombor. */
const StepRail: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < f(RAIL_IN)) return null;
  const starts = STEPS.map((s) => f(s.at));
  const done = f(ALL_DONE);
  // kedudukan garis emas pepejal (0..5)
  let lineTo = 0;
  STEPS.forEach((_, i) => {
    if (i === 0) return;
    lineTo += spring({
      frame: frame - starts[i],
      fps: FPS,
      config: { damping: 200 },
      durationInFrames: 16,
    });
  });
  const lineIn = interpolate(frame, [f(RAIL_IN), f(RAIL_IN) + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.2, 1),
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: RAIL_X - 1,
          top: NODE_Y(0),
          width: 2,
          height: (NODE_Y(5) - NODE_Y(0)) * lineIn,
          backgroundColor: rgba(C.gold, 0.32),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: RAIL_X - 1,
          top: NODE_Y(0),
          width: 2,
          height: 70 * lineTo,
          backgroundColor: C.gold,
        }}
      />
      {STEPS.map((s, i) => {
        const pop = spring({
          frame: frame - f(RAIL_IN) - i * 4,
          fps: FPS,
          config: STEP_SPRING,
        });
        const act = spring({
          frame: frame - starts[i],
          fps: FPS,
          config: STEP_SPRING,
        });
        const nextStart = i < 5 ? starts[i + 1] : done;
        const deact = spring({
          frame: frame - nextStart,
          fps: FPS,
          config: { damping: 200 },
          durationInFrames: 12,
        });
        const open = Math.max(0, act - deact);
        const size = DOT + (BADGE - DOT) * open;
        const isDone = frame >= nextStart;
        const started = frame >= starts[i];
        return (
          <React.Fragment key={s.name}>
            <div
              style={{
                position: "absolute",
                left: RAIL_X - size / 2,
                top: NODE_Y(i) - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                boxSizing: "border-box",
                backgroundColor: isDone
                  ? C.gold
                  : started
                    ? C.maroon
                    : C.espresso,
                border: `2px solid ${started ? C.gold : rgba(C.blush, 0.55)}`,
                boxShadow:
                  open > 0.05
                    ? `0 12px 28px ${rgba(C.espresso, 0.55)}`
                    : undefined,
                scale: String(pop),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  ...serifDisplay(500),
                  fontSize: 56,
                  lineHeight: 1,
                  color: C.cream,
                  opacity: Math.min(1, open * 1.4),
                  translate: "-2px -3px",
                }}
              >
                {i + 1}
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                left: RAIL_X + BADGE / 2 + 14,
                top: NODE_Y(i) - 15,
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 21,
                lineHeight: "30px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.blush,
                opacity: Math.min(1, Math.max(0, open * 1.3 - 0.3)),
                translate: `${(1 - Math.min(1, open)) * -12}px 0px`,
                whiteSpace: "nowrap",
              }}
            >
              {s.name}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/**
 * Tajuk langkah menegak (dibaca dari bawah ke atas) di margin kiri.
 * Mask line reveal: teks naik dari bawah garisan emas; letter-spacing 0.08em -> 0.02em.
 */
const StepTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const t = TITLES.find((x) => frame >= f(x.from) && frame < f(x.to));
  if (!t) return null;
  const a = f(t.from);
  const b = f(t.to);
  const rise = interpolate(
    frame,
    [a + 3, a + 19, b - 11, b - 1],
    [108, 0, 0, 108],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: [
        Easing.bezier(0.16, 1, 0.3, 1),
        Easing.linear,
        Easing.bezier(0.7, 0, 0.84, 0),
      ],
    },
  );
  const tracking = interpolate(frame, [a + 3, a + 34], [0.08, 0.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  });
  const line = interpolate(frame, [a, a + 10, b - 8, b], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.2, 1),
  });
  const BOX_W = 620;
  const BOX_H = 136;
  const LEFT = 112;
  const BOTTOM = 1262;
  return (
    <>
      {/* garisan emas (garis dasar tempat teks muncul) */}
      <div
        style={{
          position: "absolute",
          left: LEFT + BOX_H + 6,
          top: BOTTOM - BOX_W * line,
          width: 2,
          height: BOX_W * line,
          backgroundColor: C.gold,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: LEFT,
          top: BOTTOM,
          width: BOX_W,
          height: BOX_H,
          transformOrigin: "0 0",
          transform: "rotate(-90deg)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            ...serifDisplay(400),
            fontSize: 112,
            lineHeight: `${BOX_H}px`,
            color: C.cream,
            letterSpacing: `${tracking}em`,
            whiteSpace: "nowrap",
            translate: `0px ${rise}%`,
          }}
        >
          {t.text}
        </div>
      </div>
    </>
  );
};

/** Label kelajuan kecil bergaris emas ("5×") semasa speed ramp. */
const SpeedBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const scene = SCENES[sceneIndexAt(frame)];
  const seg = segAt(scene, frame / FPS);
  if (!seg.label || frame / FPS < seg.c0) return null;
  // kumpulkan segmen berlabel yang bersambung supaya label tidak berkelip pada setiap cut
  const labelled = scene.segs.filter((g) => g.label);
  let c0 = seg.c0;
  let c1 = seg.c1;
  for (const g of labelled) {
    if (Math.abs(g.c1 - c0) < 1e-6) c0 = g.c0;
  }
  for (const g of labelled) {
    if (Math.abs(g.c0 - c1) < 1e-6) c1 = g.c1;
  }
  for (const g of labelled) {
    if (Math.abs(g.c1 - c0) < 1e-6) c0 = g.c0;
    if (Math.abs(g.c0 - c1) < 1e-6) c1 = g.c1;
  }
  const inP = spring({
    frame: frame - f(c0),
    fps: FPS,
    config: { damping: 200 },
    durationInFrames: 8,
  });
  const outP = interpolate(frame, [f(c1) - 5, f(c1)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chev = (frame % 12) / 12;
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 618,
        height: 70,
        padding: "0 24px 0 20px",
        borderRadius: 35,
        border: `1.5px solid ${C.gold}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: inP * outP,
        translate: `${(1 - inP) * -16}px 0px`,
      }}
    >
      <svg width={34} height={26} viewBox="0 0 34 26">
        {[0, 1].map((i) => (
          <path
            key={i}
            d={`M ${3 + i * 14} 3 L ${14 + i * 14} 13 L ${3 + i * 14} 23`}
            fill="none"
            stroke={C.gold}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={
              0.45 + 0.55 * Math.abs(Math.sin(Math.PI * (chev + i * 0.5)))
            }
          />
        ))}
      </svg>
      <span
        style={{
          ...serifDisplay(500),
          fontSize: 48,
          lineHeight: "70px",
          color: C.gold,
          translate: "0px -3px",
        }}
      >
        {seg.label}
      </span>
    </div>
  );
};

export const LeftColumn: React.FC = () => {
  const frame = useCurrentFrame();
  const brand = 1; // jenama sudah kelihatan pada frame 0
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 54,
          top: 100,
          ...serifDisplay(500),
          fontSize: 31,
          lineHeight: "40px",
          color: C.cream,
          opacity: 0.9 * brand,
          whiteSpace: "nowrap",
        }}
      >
        Seri Lestari
      </div>
      <StepRail frame={frame} />
      <StepTitle frame={frame} />
      <SpeedBadge frame={frame} />
    </AbsoluteFill>
  );
};
