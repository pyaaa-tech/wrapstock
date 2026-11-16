import React from "react";
import { C, CX, FONT_CAP } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { backOut, clamp01, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { OtakAt } from "../components/SiOtak";
import { Duster, SparkleStar } from "../components/Props";

const Bubble: React.FC<{ f: number; at: number; x: number; y: number; text: string; color: string; tail: "left" | "right" }> = ({ f, at, x, y, text, color, tail }) => {
  if (f < at) return null;
  const s = pop(f, at, { damping: 9, stiffness: 230, mass: 0.6 });
  const floatY = Math.sin((f - at) * 0.12) * 4;
  return (
    <div
      style={{
        position: "absolute",
        // left-tail bubbles: x is the left edge; right-tail bubbles: x is the right edge
        left: tail === "left" ? x : undefined,
        right: tail === "right" ? 1080 - x : undefined,
        top: y + floatY,
        transform: `scale(${s})`,
        transformOrigin: tail === "left" ? "10% 100%" : "90% 100%",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexDirection: tail === "left" ? "row" : "row-reverse",
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 99, background: color, border: `6px solid ${C.ink}`, flexShrink: 0, position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: 18, width: 8, height: 8, borderRadius: 9, background: C.ink }} />
        <div style={{ position: "absolute", left: 30, top: 18, width: 8, height: 8, borderRadius: 9, background: C.ink }} />
        <div style={{ position: "absolute", left: 15, top: 30, width: 22, height: 10, borderBottom: `5px solid ${C.ink}`, borderRadius: "0 0 20px 20px" }} />
      </div>
      <div
        style={{
          position: "relative",
          background: C.white,
          border: `6px solid ${C.ink}`,
          borderRadius: 30,
          padding: "14px 26px",
          fontFamily: FONT_CAP,
          fontWeight: 600,
          fontSize: 36,
          color: C.ink,
          whiteSpace: "nowrap",
          boxShadow: `0 8px 0 ${C.ink}`,
        }}
      >
        {text}
        <div
          style={{
            position: "absolute",
            [tail === "left" ? "left" : "right"]: -16,
            bottom: 10,
            width: 26,
            height: 26,
            background: C.white,
            borderLeft: tail === "left" ? `6px solid ${C.ink}` : undefined,
            borderBottom: `6px solid ${C.ink}`,
            borderRight: tail === "right" ? `6px solid ${C.ink}` : undefined,
            transform: "rotate(45deg) skew(10deg, 10deg)",
          }}
        />
      </div>
    </div>
  );
};

// "Kau pun pernah siapkan assignment sebab deadline, kan? Dapat catch up? Sila komen!"
export const S7Komen: React.FC<SceneProps> = ({ f, cam }) => {
  const kau = F("kau3");
  const pun = F("pun3");
  const kan = F("kan");
  const dapat = F("dapat");
  const catchW = F("catch");
  const sila = F("sila");
  const komen = F("komen");
  const push = clamp01((f - S.s7) / (S.outro - S.s7));

  // turns to camera right after the whip lands
  const turn = 0.3 + 0.7 * pop(f, kau + 1, { damping: 9, stiffness: 200, mass: 0.7 });
  const winking = f >= kan && f < sila + 2;
  const drift = ramp(f, komen, komen + 9); // last second: eyes drift to the feather duster
  const look: [number, number] = f < kau + 4 ? [-1, 0] : drift > 0 ? [-drift, 0.7 * drift] : [0, 0];

  const bg = mixColor(C.cream, C.pink, 0.22);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 880]}
      decor={<Decor seed="s7" f={f} kind="dots" colors={[C.pink]} opacity={0.35} />}
      keys={
        <>
          <At y={170}>
            <Kinetic text="ADA TAK" at={kau} f={f} size={130} color={C.ink} stroke={C.white} strokeW={8} stagger={1.2} />
          </At>
          <At y={320}>
            <Kinetic text="KAU PUN?" at={pun} f={f} size={160} color={C.coral} stroke={C.ink} strokeW={12} depth={10} tilt={-3} stagger={1.3} />
          </At>
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        <g transform={`translate(330 1158) rotate(${-86 + Math.sin(f * 0.6) * 4 * drift}) scale(0.72)`}>
          <Duster t={f} />
        </g>
        {drift > 0
          ? [0].map((i) => (
              <g key={i} transform={`translate(150 1040) rotate(${f * 5}) scale(${backOut(drift, 2) * 0.8})`}>
                <SparkleStar r={24} />
              </g>
            ))
          : null}
        <OtakAt
          x={CX + 10}
          y={1170}
          s={0.84}
          t={f}
          turn={turn}
          squash={1 - wobble(f, kau + 1, 0.1, 0.9, 0.3) - wobble(f, kan, 0.06, 0.9, 0.3)}
          eyes={winking ? "wink" : "open"}
          mouth={winking ? "smirk" : drift > 0 ? "smirk" : f >= kau + 4 ? "smile" : "flat"}
          brows={winking || drift > 0 ? "raised" : "none"}
          blush={winking ? 1 : 0}
          look={look}
          lh={winking ? [10, 340] : [6, 372]}
          rh={winking ? [340, 220] : [394, 372]}
        />
        {winking ? (
          <g transform={`translate(${CX + 120} 760) rotate(${(f - kan) * 6}) scale(${pop(f, kan, { damping: 8, stiffness: 240 })})`}>
            <SparkleStar r={30} />
          </g>
        ) : null}
      </Stage>
      <Bubble f={f} at={dapat} x={70} y={520} text="Aku la tu!!" color={C.yellow} tail="left" />
      <Bubble f={f} at={catchW} x={944} y={612} text="Siap 3 pagi..." color={C.teal} tail="right" />
      <Bubble f={f} at={sila} x={64} y={704} text="Esok baru start" color={C.coral} tail="left" />
      <Bubble f={f} at={komen} x={944} y={796} text="Literally aku" color={C.pink} tail="right" />
    </SceneShell>
  );
};
