import React from "react";
import { spring } from "remotion";
import { C, CX, FONT_KEY } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { clamp01, mixColor, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { OtakAt, Pt } from "../components/SiOtak";
import { Desk, Laptop } from "../components/Props";
import { DrawPath } from "../components/Fx";

export const LAPTOP_X = 290;
export const DESK_Y = 1010;

/** Laptop screen content: a small 5:00 timer (match-zoomed into scene 6). */
export const MiniTimer: React.FC<{ label?: string }> = ({ label = "5:00" }) => (
  <g>
    <rect x={-96} y={-56} width={192} height={112} rx={14} fill={C.white} stroke={C.ink} strokeWidth={5} />
    <rect x={-96} y={-56} width={192} height={26} rx={10} fill={C.teal} stroke={C.ink} strokeWidth={5} />
    <text x={0} y={42} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={70} fill={C.ink}>
      {label}
    </text>
  </g>
);

// "cuba buat sikit-sikit dulu."
export const S5bMulaKecil: React.FC<SceneProps> = ({ f, cam }) => {
  const cuba = F("cuba");
  const sikit = F("sikitsikit");
  const dulu = F("dulu");
  const push = clamp01((f - S.s5b) / (S.s6 - S.s5b));

  // smash cut: the lid is already flying open on the first frame
  const open = clamp01(0.35 + 0.65 * spring({ frame: f - cuba, fps: 30, config: { damping: 8, stiffness: 260, mass: 0.6 } }));
  const typing = f >= sikit;
  const lh: Pt = typing ? [-150 + Math.sin(f * 1.6) * 10, 352 - Math.abs(Math.sin(f * 1.6)) * 16] : [-170, 300];
  const rh: Pt = typing ? [-60 + Math.cos(f * 1.6) * 10, 356 - Math.abs(Math.cos(f * 1.6)) * 16] : [6, 372];

  const bg = mixColor(C.cream, C.teal, 0.3);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      pushAmt={0.08}
      focus={[LAPTOP_X + 100, 880]}
      decor={<Decor seed="s5b" f={f} kind="rays" colors={[C.white]} opacity={0.35} cx={LAPTOP_X} cy={880} />}
      keys={
        <>
          <At y={180}>
            <Kinetic text="MULA" at={cuba} f={f} size={170} color={C.yellow} stroke={C.ink} strokeW={12} depth={10} tilt={-3} stagger={1} />
          </At>
          <At y={360}>
            <div style={{ position: "relative" }}>
              <Kinetic text="KECIL" at={sikit} f={f} size={170} color={C.coral} stroke={C.ink} strokeW={12} depth={10} tilt={2} stagger={1.1} />
              <svg width={600} height={120} style={{ position: "absolute", left: -40, top: 170, overflow: "visible" }}>
                <DrawPath d="M 30 40 Q 260 70 520 30" f={f} from={sikit + 6} dur={dulu - sikit - 4} color={C.ink} width={16} />
              </svg>
            </div>
          </At>
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        <OtakAt
          x={700}
          y={1100}
          s={0.95}
          t={f}
          squash={1 - wobble(f, cuba, 0.12, 0.9, 0.3)}
          lean={-8}
          eyes="open"
          mouth={typing ? "smirk" : "grin"}
          brows="determined"
          look={[-1, 0.6]}
          lh={lh}
          rh={rh}
        />
        <g transform={`translate(${CX - 60} ${DESK_Y})`}>
          <Desk w={760} />
        </g>
        <g transform={`translate(${LAPTOP_X} ${DESK_Y})`}>
          <Laptop w={270} open={open} glow={ramp(f, cuba + 2, cuba + 8)} screen={<MiniTimer />} />
        </g>
        {/* little "action" ticks on the lid snap */}
        {f >= cuba && f < cuba + 10
          ? [0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M ${LAPTOP_X - 150 + i * 150} ${DESK_Y - 210 - (f - cuba) * 6} l ${(i - 1) * 16} -36`}
                stroke={C.ink}
                strokeWidth={10}
                strokeLinecap="round"
                opacity={1 - (f - cuba) / 10}
              />
            ))
          : null}
      </Stage>
    </SceneShell>
  );
};
