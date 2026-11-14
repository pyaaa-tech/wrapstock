import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";
import { FPS, K, SCREEN, f } from "../geometry";
import { C, SANS, rgba } from "../theme";
import { CALLOUTS, Callout, TAPS, cameraAt, toScreen } from "../timeline";

const PILL_RIGHT = 280; // tepi kanan pil (kanvas) — betul-betul di kiri bezel
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const One: React.FC<{ c: Callout; frame: number }> = ({ c, frame }) => {
  const PAD = c.label ? 6 : 4;
  const a = f(c.from);
  const b = f(c.to);
  const local = frame - a;
  const cam = cameraAt(frame);
  const [sx0, sy0] = toScreen(cam, c.rect[0], c.rect[1]);
  const [sx1, sy1] = toScreen(cam, c.rect[2], c.rect[3]);
  // cincin sentiasa di dalam skrin telefon
  const x0 = SCREEN.x + clamp(sx0 - PAD, 5, SCREEN.w - 5);
  const x1 = SCREEN.x + clamp(sx1 + PAD, 5, SCREEN.w - 5);
  const y0 = SCREEN.y + clamp(sy0 - PAD, 5, SCREEN.h - 5);
  const y1 = SCREEN.y + clamp(sy1 + PAD, 5, SCREEN.h - 5);
  const w = x1 - x0;
  const h = y1 - y0;
  const radius = Math.min((c.r ?? 10) * K * cam.z + PAD, h / 2);
  const appear = spring({
    frame: local,
    fps: FPS,
    config: { damping: 200 },
    durationInFrames: 8,
  });
  const out = interpolate(frame, [b, b + 5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = (local % 30) / 30;

  const cy = (y0 + y1) / 2;
  const xs = PILL_RIGHT + 6;
  let pillCy: number;
  let d: string;
  let len: number;
  let dot: [number, number];
  if (c.fromBelow) {
    // pil di bawah paras sasaran; garisan lalu di bawah butang jiran, kemudian naik ke tepi bawah cincin
    pillCy = c.pillY ?? y1 + 40;
    const cxm = (x0 + x1) / 2;
    d = `M ${xs} ${pillCy} H ${cxm} V ${y1}`;
    len = cxm - xs + (pillCy - y1);
    dot = [cxm, y1];
  } else {
    pillCy = c.pillY ?? clamp(cy, 640, 1288);
    const endY = clamp(pillCy, y0 + 14, y1 - 14);
    const xm = Math.min(x0 - 12, xs + 16);
    const straight = Math.abs(endY - pillCy) < 1;
    d = straight
      ? `M ${xs} ${pillCy} H ${x0}`
      : `M ${xs} ${pillCy} H ${xm} V ${endY} H ${x0}`;
    len = straight ? x0 - xs : xm - xs + Math.abs(endY - pillCy) + (x0 - xm);
    dot = [x0, endY];
  }
  const draw = interpolate(local, [2, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.2, 1),
  });
  const pill = spring({
    frame: local - 4,
    fps: FPS,
    config: { damping: 200 },
    durationInFrames: 9,
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      {/* denyutan */}
      <div
        style={{
          position: "absolute",
          left: x0 - pulse * 14,
          top: y0 - pulse * 14,
          width: w + pulse * 28,
          height: h + pulse * 28,
          borderRadius: radius + pulse * 14,
          border: `2px solid ${C.gold}`,
          opacity: (1 - pulse) * 0.7 * appear,
        }}
      />
      {/* cincin emas */}
      <div
        style={{
          position: "absolute",
          left: x0,
          top: y0,
          width: w,
          height: h,
          borderRadius: radius,
          border: `3px solid ${C.gold}`,
          boxSizing: "border-box",
          boxShadow: `0 0 0 1px ${rgba(C.espresso, 0.35)}, 0 0 24px ${rgba(C.gold, 0.5)}`,
          opacity: appear,
          scale: String(1 + (1 - appear) * 0.06),
        }}
      />
      {c.tag ? (
        <div
          style={{
            position: "absolute",
            ...(c.tagAbove
              ? { right: 1080 - x1 + 10, top: y0 - 52 }
              : { left: x1 + 12, top: (y0 + y1) / 2 - 22 }),
            height: 44,
            padding: "0 18px",
            borderRadius: 22,
            backgroundColor: C.maroon,
            color: C.cream,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 25,
            lineHeight: "44px",
            whiteSpace: "nowrap",
            boxShadow: `0 8px 20px ${rgba(C.espresso, 0.35)}`,
            opacity: pill,
            translate: `${(1 - pill) * -10}px 0px`,
          }}
        >
          {c.tag}
        </div>
      ) : null}
      {c.label ? (
        <>
          <svg
            width={1080}
            height={1920}
            style={{ position: "absolute", inset: 0 }}
          >
            <path
              d={d}
              fill="none"
              stroke={C.gold}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - draw)}
            />
            <circle cx={dot[0]} cy={dot[1]} r={5.5 * draw} fill={C.gold} />
          </svg>
          <div
            style={{
              position: "absolute",
              right: 1080 - PILL_RIGHT,
              top: pillCy,
              translate: `${(1 - pill) * -14}px -50%`,
              opacity: pill,
              padding: "13px 20px 14px",
              borderRadius: 28,
              backgroundColor: C.maroon,
              boxShadow: `0 0 0 1px ${rgba(C.cream, 0.16)}, 0 14px 30px ${rgba(C.espresso, 0.5)}`,
              color: C.cream,
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 27,
              lineHeight: "33px",
              whiteSpace: "pre",
              textAlign: "right",
            }}
          >
            {c.label}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** Cincin emas berdenyut + pil maroon (teks butang asal) + garisan pemimpin dilukis. */
export const Callouts: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {CALLOUTS.filter((c) => frame >= f(c.from) && frame < f(c.to) + 5).map(
        (c, i) => (
          <One key={`${c.from}-${i}`} c={c} frame={frame} />
        ),
      )}
    </AbsoluteFill>
  );
};

/** Riak sentuhan emas pada setiap tekan. */
export const TapRipples: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  return (
    <AbsoluteFill>
      {TAPS.filter((t) => frame >= f(t.c) && frame < f(t.c) + 14).map((t) => {
        const u = (frame - f(t.c)) / 14;
        const e = 1 - Math.pow(1 - u, 2.4);
        const [sx, sy] = toScreen(cam, t.at[0], t.at[1]);
        const r = 16 + e * 58;
        return (
          <React.Fragment key={t.c}>
            <div
              style={{
                position: "absolute",
                left: SCREEN.x + sx - r,
                top: SCREEN.y + sy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                border: `3px solid ${C.gold}`,
                boxSizing: "border-box",
                opacity: 1 - u,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: SCREEN.x + sx - 15,
                top: SCREEN.y + sy - 15,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: rgba(C.gold, 0.75),
                opacity: 1 - Math.min(1, u * 1.6),
                scale: String(1 - u * 0.4),
              }}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
