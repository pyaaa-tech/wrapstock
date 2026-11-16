import React from "react";
import { spring } from "remotion";
import { C, CX, FONT_KEY } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { antic, clamp01, easeInCubic, hopY, mixColor, pop, ramp, wobble } from "../lib/anim";
import { Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { outline } from "../components/Kinetic";
import { OtakAt, Pt } from "../components/SiOtak";
import { Duster, SparkleStar } from "../components/Props";

const PIVOT: [number, number] = [CX, 584];
const PLANK = 840;

// "Kononnya, lega sekarang, susah kemudian. Jadinya, bila kau rasa nak lari,"
export const S5SeeSaw: React.FC<SceneProps> = ({ f, cam }) => {
  const kononnya = F("kononnya");
  const lega = F("lega2");
  const susah = F("susah");
  const bila = F("bila");
  const rasa = F("rasa4");
  const lari = F("lari");
  const push = clamp01((f - S.s5) / (S.s5b - S.s5));

  const sawIn = pop(f, kononnya, { damping: 11, stiffness: 180 });
  const leftIn = pop(f, lega, { damping: 13, stiffness: 170, mass: 0.8 });
  // right card: anticipation lift, then a 3-frame drop that lands on "susah"
  const dropU = clamp01((f - (susah - 3)) / 3);
  const rightY = f < susah - 3 ? -1400 : -620 * (1 - easeInCubic(dropU)) - 40 * antic(f, susah - 3, 4);
  const rightSq = wobble(f, susah, 0.2, 0.95, 0.3);
  const heavy = spring({ frame: f - susah, fps: 30, config: { damping: 5.5, stiffness: 150, mass: 0.8 } });
  const angle = -8 * pop(f, lega + 5, { damping: 9, stiffness: 160 }) * (1 - heavy) + 13 * heavy;
  const leftHop = hopY(f, susah, 46, 10);

  // the temptation: duster appears, Si Otak tiptoes towards it
  const dusterIn = pop(f, bila, { damping: 9, stiffness: 200 });
  const tip = ramp(f, rasa, lari + 14);
  const ox = CX - 20 + 150 * tip;
  const step = f >= rasa ? Math.sin((f - rasa) * 0.55) : 0;
  const lf: Pt = [158 + step * 18, 446 - Math.max(0, step) * 22];
  const rf: Pt = [242 + step * 18, 446 - Math.max(0, -step) * 22];
  const sneaky = f >= bila;

  const bg = mixColor(C.cream, C.yellow, 0.12);
  const card = (bgc: string, w: number, h: number, children: React.ReactNode, extra?: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        background: bgc,
        border: `9px solid ${C.ink}`,
        borderRadius: 26,
        boxShadow: `0 10px 0 ${C.ink}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_KEY,
        fontWeight: 800,
        lineHeight: 0.95,
        ...extra,
      }}
    >
      {children}
    </div>
  );

  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 800]}
      decor={<Decor seed="s5" f={f} colors={[C.yellow, C.teal, C.pink]} opacity={0.15} />}
      keys={
        <div
          style={{
            position: "absolute",
            left: PIVOT[0],
            top: PIVOT[1],
            width: 0,
            height: 0,
            transform: `scale(${sawIn})`,
          }}
        >
          {/* fulcrum */}
          <svg width={200} height={150} viewBox="-100 0 200 150" style={{ position: "absolute", left: -100, top: 0, overflow: "visible" }}>
            <path d="M 0 4 L 78 132 L -78 132 Z" fill={C.teal} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
            <circle cx={0} cy={18} r={12} fill={C.ink} />
          </svg>
          <div style={{ position: "absolute", left: 0, top: 0, rotate: `${angle}deg` }}>
            {/* plank */}
            <div
              style={{
                position: "absolute",
                left: -PLANK / 2,
                top: -16,
                width: PLANK,
                height: 30,
                background: "#C98B5B",
                border: `8px solid ${C.ink}`,
                borderRadius: 16,
                boxSizing: "border-box",
              }}
            />
            {/* LEGA SEKARANG slides in from the left */}
            <div style={{ position: "absolute", left: -PLANK / 2 + 20 - 900 * (1 - leftIn), top: -16 + leftHop, rotate: `${-14 * (1 - leftIn)}deg` }}>
              {leftIn > 0.001
                ? card(
                    C.teal,
                    330,
                    170,
                    <>
                      <span style={{ fontSize: 84, color: C.white, textShadow: outline(6, C.ink) }}>LEGA</span>
                      <span style={{ fontSize: 56, color: C.white, textShadow: outline(5, C.ink) }}>SEKARANG</span>
                    </>,
                    { top: -170 },
                  )
                : null}
            </div>
            {/* SUSAH NANTI slams in from the right, heavier */}
            <div style={{ position: "absolute", left: PLANK / 2 - 430, top: -16 + rightY, transformOrigin: "190px 0px", scale: `${1 + rightSq * 0.6} ${1 - rightSq}` }}>
              {f >= susah - 3
                ? card(
                    C.ink,
                    380,
                    230,
                    <>
                      <span style={{ fontSize: 112, color: C.coral, textShadow: outline(5, C.white) }}>SUSAH</span>
                      <span style={{ fontSize: 100, color: C.yellow }}>NANTI</span>
                    </>,
                    { top: -230, borderColor: C.ink },
                  )
                : null}
            </div>
          </div>
          {/* impact dust */}
          {f >= susah && f < susah + 16
            ? [0, 1, 2, 3].map((i) => {
                const d = f - susah;
                const a = (i < 2 ? -1 : 1) * (0.4 + (i % 2) * 0.5);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: PLANK / 2 - 200 + Math.cos(a) * d * 14 * (i < 2 ? -1 : 1),
                      top: 70 - d * 6,
                      width: 40 - d * 2,
                      height: 40 - d * 2,
                      borderRadius: 99,
                      background: C.white,
                      border: `4px solid ${C.ink}`,
                      opacity: 1 - d / 16,
                    }}
                  />
                );
              })
            : null}
        </div>
      }
    >
      <Floor y={1176} />
      <Stage>
        {dusterIn > 0.01 ? (
          <g transform={`translate(860 1176) rotate(${-62 + Math.sin(f * 0.4) * 4}) scale(${0.8 * dusterIn})`}>
            <Duster t={f} />
          </g>
        ) : null}
        {sneaky
          ? [0, 1].map((i) => (
              <g key={i} transform={`translate(${790 + i * 120} ${1010 - i * 70}) rotate(${f * 5}) scale(${0.4 + 0.5 * Math.abs(Math.sin(f * 0.25 + i))})`}>
                <SparkleStar r={20} />
              </g>
            ))
          : null}
        <OtakAt
          x={ox}
          y={1170 + (f >= rasa ? -Math.abs(step) * 8 : 0)}
          s={0.9}
          t={f}
          squash={1 - wobble(f, susah, 0.14, 0.9, 0.3) - 0.06 * Math.abs(step)}
          lean={sneaky ? 8 : 0}
          eyes={f < susah ? (f >= lega ? "happy" : "open") : "open"}
          mouth={sneaky ? "smirk" : f >= susah ? "o" : f >= lega ? "grin" : "smile"}
          brows={sneaky ? "raised" : f >= susah ? "worried" : "none"}
          look={sneaky ? [1, 0.6] : f >= susah ? [0.6, -1] : f >= lega ? [-0.6, -1] : [0, -0.6]}
          lh={sneaky ? [60, 300] : [6, 372]}
          rh={sneaky ? [300, 330] : [394, 372]}
          lf={lf}
          rf={rf}
        />
        {f >= lari ? (
          <g transform={`translate(${ox + 190} 830) rotate(12) scale(${pop(f, lari, { damping: 8, stiffness: 240 })})`}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={110} fill={C.coral} stroke={C.ink} strokeWidth={8} paintOrder="stroke">
              ?!
            </text>
          </g>
        ) : null}
      </Stage>
    </SceneShell>
  );
};
