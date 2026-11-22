import React from "react";
import { C, CX, FONT_CAP, FONT_KEY } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { antic, clamp01, easeInCubic, easeOutCubic, hopSquash, hopY, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { BrainMeter, Magnifier, Window } from "../components/Bedroom";
import { OtakAt, Pt } from "../components/SiOtak";
import { SparkleStar } from "../components/Props";

// [thoughtful] "Tapi kajian tu kecil je... jadi belum muktamad."
export const S6Stamp: React.FC<SceneProps> = ({ f, cam }) => {
  const tapi = F("tapi");
  const kajian = F("kajian2");
  const kecil = F("kecil2");
  const je = F("je2");
  const muktamad = F("muktamad");
  const push = clamp01((f - S.s6) / (S.s7 - S.s6));
  const paperS = 1 - 0.62 * pop(f, kecil, { damping: 8, stiffness: 240 });
  const magIn = pop(f, kajian, { damping: 11, stiffness: 190 });
  // stamp: lifts on "belum" (anticipation), slams on "muktamad"
  const dropU = clamp01((f - (muktamad - 3)) / 3);
  const stampScale = f < muktamad - 3 ? 0 : 2.4 - 1.4 * easeInCubic(dropU) - 0.15 * antic(f, muktamad - 3, 4);
  const stampSq = wobble(f, muktamad, 0.16, 0.9, 0.3);
  const bg = mixColor(C.cream, C.pink, 0.12);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 900]}
      decor={<Decor seed="s6" f={f} kind="squiggles" colors={[C.pink, C.teal]} opacity={0.24} />}
      keys={
        <>
          <At y={175} style={{ gap: 22 }}>
            <Kinetic text="KAJIAN" at={kajian} f={f} size={120} color={C.ink} stroke={C.white} strokeW={9} />
            <Kinetic text="KECIL" at={kecil} f={f} size={96} color={C.teal} stroke={C.ink} strokeW={9} depth={7} />
            <Kinetic text="JE..." at={je} f={f} size={96} color={C.ink} stroke={C.white} strokeW={8} />
          </At>
          {f >= muktamad - 3 ? (
            <At y={330}>
              <div
                style={{
                  transform: `rotate(-7deg) scale(${stampScale * (1 + stampSq * 0.5)}, ${stampScale * (1 - stampSq)})`,
                  border: `12px solid ${C.coral}`,
                  outline: `4px solid ${C.coral}`,
                  outlineOffset: 8,
                  borderRadius: 22,
                  padding: "10px 34px 4px",
                  fontFamily: FONT_KEY,
                  fontWeight: 800,
                  fontSize: 84,
                  lineHeight: 1,
                  color: C.coral,
                  background: "rgba(255,255,255,0.55)",
                  whiteSpace: "nowrap",
                  opacity: f < muktamad ? 0.6 : 1,
                }}
              >
                BELUM MUKTAMAD
              </div>
            </At>
          ) : null}
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        {/* the (tiny) study on a little stand */}
        <g transform={`translate(745 1176)`}>
          <rect x={-70} y={-120} width={140} height={120} rx={10} fill="#C98B5B" stroke={C.ink} strokeWidth={8} />
          <g transform={`translate(0 -120) scale(${paperS}) rotate(-4)`}>
            <path d="M -70 0 L -70 -190 L 40 -190 L 70 -160 L 70 0 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
            {[-150, -120, -90, -60, -30].map((y, i) => (
              <path key={y} d={`M -48 ${y} L ${i % 2 ? 20 : 48} ${y}`} stroke={C.gray} strokeWidth={8} strokeLinecap="round" />
            ))}
          </g>
        </g>
        {magIn > 0.01 ? (
          <g transform={`translate(${700 + Math.sin(f * 0.12) * 14} ${930 + Math.cos(f * 0.1) * 10}) scale(${magIn * 0.9}) rotate(-10)`}>
            <Magnifier r={80} />
          </g>
        ) : null}
        <OtakAt
          x={330}
          y={1170}
          s={0.9}
          t={f}
          eyes="open"
          look={[0.6, -0.8]}
          brows={f >= muktamad ? "worried" : "raised"}
          mouth={f >= muktamad ? "o" : "flat"}
          lh={[10, 380]}
          rh={[262, 330]}
          squash={1 - wobble(f, muktamad, 0.1, 0.9, 0.3) - wobble(f, tapi, 0.05, 0.6, 0.2)}
          lean={-3}
        />
        {/* "thinking" dots */}
        {f < muktamad
          ? [0, 1, 2].map((i) => (
              <circle key={i} cx={430 + i * 34} cy={690 - i * 26} r={9 + i * 4} fill={C.white} stroke={C.ink} strokeWidth={5} opacity={clamp01((f - tapi - i * 5) / 4)} />
            ))
          : null}
      </Stage>
    </SceneShell>
  );
};

// [cheerfully] "Lepas bangun, buka langsir. Cahaya pagi bantu otak kau sedar."
export const S7Curtain: React.FC<SceneProps> = ({ f, cam }) => {
  const lepas = F("lepas2");
  const buka = F("buka");
  const langsir = F("langsir");
  const cahaya = F("cahaya");
  const pagi = F("pagi");
  const bantu = F("bantu");
  const sedar = F("sedar");
  const push = clamp01((f - S.s7) / (S.s8 - S.s7));
  const open = f < langsir ? -0.04 * antic(f, langsir, 6) : pop(f, langsir, { damping: 11, stiffness: 170 });
  const day = easeOutCubic(ramp(f, langsir, pagi + 12));
  const meterIn = pop(f, bantu - 2, { damping: 11, stiffness: 190 });
  const level = 0.12 + 0.88 * easeOutCubic(ramp(f, bantu, sedar));
  const on = f >= sedar;
  const awake = f >= cahaya;
  const stretch = f >= lepas && f < buka - 4;
  const grab = f >= buka - 2 && f < langsir + 10;
  const lh: Pt = stretch ? [60, 90] : grab ? [400 + 90 * clamp01(open), 230] : on ? [-20, 120] : [6, 372];
  const rh: Pt = stretch ? [340, 90] : grab ? [470 + 90 * clamp01(open), 230] : on ? [420, 120] : [394, 372];
  const bg = mixColor(mixColor(C.cream, "#3A3A63", 0.42), mixColor(C.cream, C.yellow, 0.25), day);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 900]}
      decor={
        <>
          <Decor seed="s7d" f={f} kind="dots" colors={[C.white]} opacity={0.1 * (1 - day)} />
          {day > 0.01 ? <Decor seed="s7" f={f} kind="rays" colors={[C.yellow]} opacity={0.42 * day} cx={640} cy={830} /> : null}
        </>
      }
      keys={
        <>
          <At y={170} style={{ gap: 24 }}>
            <Kinetic text="BUKA" at={buka} f={f} size={122} color={C.white} stroke={C.ink} strokeW={10} depth={8} />
            <Kinetic text="LANGSIR!" at={langsir} f={f} size={122} mode="slam" color={C.coral} stroke={C.ink} strokeW={11} depth={9} tilt={-2} />
          </At>
          <At y={330}>
            <Kinetic text="CAHAYA PAGI" at={cahaya} f={f} size={120} color={C.yellow} stroke={C.ink} strokeW={10} depth={8} stagger={1} />
          </At>
          {meterIn > 0.01 ? (
            <svg width={1080} height={700} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              <g transform={`translate(${CX - 270} 545) scale(${meterIn})`}>
                <BrainMeter level={level} on={on} w={400} />
              </g>
              {on
                ? [0, 1, 2, 3].map((i) => (
                    <g key={i} transform={`translate(${CX + 270 + Math.cos(i * 1.6) * 90} ${545 + Math.sin(i * 1.6) * 70}) rotate(${f * 5}) scale(${pop(f, sedar + i, { damping: 8, stiffness: 240 }) * clamp01(1 - (f - sedar - 10) / 10)})`}>
                      <SparkleStar r={18} />
                    </g>
                  ))
                : null}
            </svg>
          ) : null}
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        <g transform="translate(650 890)">
          <Window open={clamp01(open) * 1.0} day={day} t={f} w={420} h={430} />
        </g>
        {/* light beam into the room */}
        {day > 0.02 ? <path d="M 440 680 L 860 680 L 1000 1180 L 120 1180 Z" fill={C.yellow} opacity={0.16 * day} /> : null}
        <OtakAt
          x={300}
          y={1170 + hopY(f, sedar, 50, 10)}
          s={0.86}
          t={f}
          eyes={on ? "sparkle" : awake ? "happy" : "open"}
          sparkleSpin={f * 4}
          droop={awake ? 0 : 0.5}
          mouth={on ? "grin" : awake ? "grin" : stretch ? "o" : "flat"}
          brows={grab ? "determined" : "none"}
          nightcap={f < langsir ? 1 : 0}
          look={[1, -0.3]}
          lh={lh}
          rh={rh}
          lean={grab ? 8 : 0}
          squash={(stretch ? 1.08 : 1) * hopSquash(f, sedar, 10) - wobble(f, langsir, 0.1, 0.9, 0.3)}
        />
      </Stage>
    </SceneShell>
  );
};

const Bubble: React.FC<{ f: number; at: number; x: number; y: number; text: string; color: string; tail: "left" | "right" }> = ({ f, at, x, y, text, color, tail }) => {
  if (f < at) return null;
  const s = pop(f, at, { damping: 9, stiffness: 230, mass: 0.6 });
  return (
    <div
      style={{
        position: "absolute",
        left: tail === "left" ? x : undefined,
        right: tail === "right" ? 1080 - x : undefined,
        top: y + Math.sin((f - at) * 0.12) * 4,
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
      </div>
    </div>
  );
};

// [warmly] "Dapat catch up? Sila komen!"
export const S8Komen: React.FC<SceneProps> = ({ f, cam }) => {
  const dapat = F("dapat");
  const catchW = F("catch");
  const sila = F("sila");
  const komen = F("komen");
  const push = clamp01((f - S.s8) / (S.outro - S.s8));
  const wave = Math.sin((f - dapat) * 0.55) * 30;
  const bg = mixColor(C.cream, C.pink, 0.22);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 880]}
      decor={<Decor seed="s8" f={f} kind="dots" colors={[C.pink]} opacity={0.35} />}
      keys={
        <>
          <At y={170}>
            <Kinetic text="DAPAT CATCH UP?" at={dapat} f={f} size={90} color={C.ink} stroke={C.white} strokeW={9} stagger={0.8} />
          </At>
          <At y={315}>
            <Kinetic text="SILA KOMEN!" at={sila} f={f} size={120} color={C.coral} stroke={C.ink} strokeW={12} depth={10} tilt={-3} stagger={0.9} />
          </At>
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        <OtakAt
          x={CX + 10}
          y={1170 + hopY(f, sila, 40, 9)}
          s={0.84}
          t={f}
          eyes={f >= komen ? "wink" : "happy"}
          mouth="grin"
          blush={1}
          brows="raised"
          lh={[10, 360]}
          rh={[380 + wave * 0.6, 120 + Math.abs(wave) * 0.3]}
          squash={hopSquash(f, sila, 9)}
        />
      </Stage>
      <Bubble f={f} at={dapat} x={90} y={520} text="Snooze 5 kali..." color={C.yellow} tail="left" />
      <Bubble f={f} at={catchW} x={918} y={612} text="Aku la tu!!" color={C.teal} tail="right" />
      <Bubble f={f} at={sila} x={84} y={704} text="5 minit = 1 jam" color={C.coral} tail="left" />
      <Bubble f={f} at={komen} x={918} y={796} text="Esok try langsir!" color={C.pink} tail="right" />
    </SceneShell>
  );
};
