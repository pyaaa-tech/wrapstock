import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";
import { DURATION, FPS, H, K, SCREEN, W, f } from "../geometry";
import { lotusRosette, petalPath, wipeGeom, WIPE_FRAMES } from "../petal";
import { C, SANS, rgba, serifDisplay } from "../theme";
import { END_CARD } from "../timeline";
import { Grain } from "./Grain";

const CX = 505; // tengah zon selamat (kanan 130 px bebas)
const CALM = DURATION - 8; // 8 frame terakhir: tiada apa-apa bergerak

/** Garisan teratai buatan sendiri (bukan logo sedia ada): 7 kelopak + garis air, dilukis dengan stroke. */
const LotusLine: React.FC<{ frame: number; start: number }> = ({
  frame,
  start,
}) => {
  const cx = 0;
  const cy = 0;
  const petals: { d: string; delay: number }[] = [
    { d: petalPath(cx, cy, 190, 0, 0.92), delay: 0 },
    { d: petalPath(cx - 6, cy + 6, 168, -27, 0.95), delay: 5 },
    { d: petalPath(cx + 6, cy + 6, 168, 27, 0.95), delay: 5 },
    { d: petalPath(cx - 14, cy + 14, 150, -55, 0.9), delay: 10 },
    { d: petalPath(cx + 14, cy + 14, 150, 55, 0.9), delay: 10 },
    { d: petalPath(cx - 24, cy + 20, 124, -82, 0.78), delay: 15 },
    { d: petalPath(cx + 24, cy + 20, 124, 82, 0.78), delay: 15 },
  ];
  const water = interpolate(frame, [start + 24, start + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.2, 1),
  });
  return (
    <svg
      width={520}
      height={320}
      viewBox="-260 -230 520 320"
      style={{
        position: "absolute",
        left: CX - 260,
        top: 330,
        overflow: "visible",
      }}
    >
      {petals.map((p, i) => {
        const prog = interpolate(
          frame,
          [start + p.delay, start + p.delay + 30],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.3, 0, 0.2, 1),
          },
        );
        return (
          <path
            key={i}
            d={p.d}
            pathLength={1}
            fill={rgba(C.gold, 0.06 * prog)}
            stroke={C.gold}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={1 - prog}
          />
        );
      })}
      <path
        d="M -210 52 C -120 40, -60 62, 0 52 C 60 42, 120 64, 210 52"
        pathLength={1}
        fill="none"
        stroke={C.gold}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={1}
        strokeDashoffset={1 - water}
        opacity={0.8}
      />
      <path
        d="M -120 76 C -60 68, -20 82, 30 76 C 70 71, 100 80, 130 76"
        pathLength={1}
        fill="none"
        stroke={C.gold}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeDasharray={1}
        strokeDashoffset={1 - water}
        opacity={0.5}
      />
    </svg>
  );
};

const MaskLine: React.FC<{
  frame: number;
  at: number;
  top: number;
  height: number;
  children: React.ReactNode;
}> = ({ frame, at, top, height, children }) => {
  const rise = interpolate(frame, [at, at + 18], [106, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: CX - 450,
        width: 900,
        top,
        height,
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <div style={{ translate: `0px ${rise}%` }}>{children}</div>
    </div>
  );
};

/** B11: kad penutup. Wipe-masuk kelopak teratai dari butang Contact Outlet. */
export const EndCard: React.FC = () => {
  const raw = useCurrentFrame();
  const start = f(END_CARD.start);
  if (raw < start) return null;
  const frame = Math.min(raw, CALM); // beku pada 8 frame terakhir
  const p = (raw - start) / WIPE_FRAMES;
  const cx = SCREEN.x + END_CARD.origin[0] * K;
  const cy = SCREEN.y + END_CARD.origin[1] * K;
  const g = wipeGeom(cx, cy, p, W, H);
  const tTitle = f(94.38); // "Mudah kan?"
  const tCta = f(95.47); // "Klik pautan tempahan di bio"
  const tBio = f(96.61); // "bio"
  const tName = f(98.19); // "Seri Lestari Spa Batu Pahat"
  const cta = spring({
    frame: frame - tCta,
    fps: FPS,
    config: { damping: 14, stiffness: 120 },
  });
  const ctaPulse = interpolate(frame, [tBio, tBio + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rule = interpolate(frame, [tTitle + 10, tTitle + 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.2, 1),
  });
  const underline = interpolate(frame, [tName, tName + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.2, 1),
  });
  const d = p < 1 ? lotusRosette(cx, cy, g.R, g.rot) : "";
  return (
    <>
      {p < 1 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path
            d={d}
            fill="none"
            stroke={C.gold}
            strokeWidth={8}
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <AbsoluteFill style={p < 1 ? { clipPath: `path('${d}')` } : undefined}>
        <AbsoluteFill style={{ backgroundColor: C.espresso }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(70% 46% at 47% 36%, ${rgba(C.maroon, 0.62)} 0%, ${rgba(C.maroon, 0.16)} 58%, ${rgba(
              C.espresso,
              0,
            )} 100%)`,
          }}
        />
        <Grain frame={frame} opacity={0.11} />
        <LotusLine frame={frame} start={start + 6} />

        <MaskLine frame={frame} at={tTitle} top={690} height={150}>
          <span
            style={{
              ...serifDisplay(400),
              fontSize: 116,
              lineHeight: "150px",
              color: C.cream,
              letterSpacing: "0.01em",
            }}
          >
            Seri Lestari Spa
          </span>
        </MaskLine>
        {/* garis emas halus: 120 px bersama tajuk, memanjang bila nama disebut */}
        <div
          style={{
            position: "absolute",
            left: CX - (60 + 200 * underline) * rule,
            top: 856,
            width: (120 + 400 * underline) * rule,
            height: 2,
            backgroundColor: C.gold,
          }}
        />
        <MaskLine frame={frame} at={tTitle + 8} top={878} height={84}>
          <span
            style={{
              ...serifDisplay(400),
              fontSize: 58,
              lineHeight: "84px",
              color: C.gold,
              letterSpacing: "0.02em",
            }}
          >
            Batu Pahat
          </span>
        </MaskLine>
        {/* CTA */}
        <div
          style={{
            position: "absolute",
            left: CX - 330,
            top: 1070,
            width: 660,
            height: 116,
            borderRadius: 58,
            backgroundColor: C.maroon,
            boxShadow: `0 0 0 2px ${rgba(C.gold, 0.85)}, 0 26px 60px ${rgba("#000000", 0.45)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            opacity: Math.min(1, cta * 1.5),
            scale: String(0.86 + 0.14 * cta),
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 46,
              color: C.cream,
              letterSpacing: "-0.01em",
            }}
          >
            Tempah di pautan bio
          </span>
          <svg width={34} height={34} viewBox="0 0 34 34">
            <path
              d="M 8 26 L 26 8 M 12 8 H 26 V 22"
              fill="none"
              stroke={C.gold}
              strokeWidth={3.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* satu denyutan cincin emas bila "bio" disebut */}
        <div
          style={{
            position: "absolute",
            left: CX - 330 - ctaPulse * 22,
            top: 1070 - ctaPulse * 22,
            width: 660 + ctaPulse * 44,
            height: 116 + ctaPulse * 44,
            borderRadius: 58 + ctaPulse * 22,
            border: `2px solid ${C.gold}`,
            boxSizing: "border-box",
            opacity: frame >= tBio ? (1 - ctaPulse) * 0.8 : 0,
          }}
        />
      </AbsoluteFill>
    </>
  );
};
