import React from "react";
import { C, CX } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { clamp01, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { InBed } from "../components/Sets";
import { BrainMeter, DizzyOrbit, Fog } from "../components/Bedroom";
import { OtakAt, Pt } from "../components/SiOtak";

const NIGHT = "#3A3A63";
const OS = 0.85;

/** Finger for the "shh" gesture, drawn at the hand. */
const Finger: React.FC = () => (
  <g>
    <path d="M 0 -4 L 0 -50" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
    <path d="M 0 -4 L 0 -50" stroke={C.pink} strokeWidth={10} strokeLinecap="round" />
  </g>
);

// [whispers] "Sebenarnya, masa baru bangun, otak kau belum betul-betul on."
export const S3Groggy: React.FC<SceneProps> = ({ f, cam }) => {
  const seb = F("sebenarnya");
  const bangun = F("bangun");
  const otak = F("otak");
  const belum = F("belum");
  const betul = F("betulbetul");
  const on = F("on");
  const push = clamp01((f - S.s3) / (S.s3b - S.s3));
  const shh = f < bangun + 6;
  const toMouth: Pt = [214, 300];
  const rh: Pt = shh ? [394 + (toMouth[0] - 394) * pop(f, seb + 1), 372 + (toMouth[1] - 372) * pop(f, seb + 1)] : [394, 380];
  const meterIn = pop(f, otak - 2, { damping: 11, stiffness: 190 });
  // level crawls, flickers, never makes it
  let level = 0.12 + 0.06 * Math.sin(f * 0.5) * (f >= belum ? 1 : 0.3);
  if (f >= betul && f < on) level = 0.12 + 0.18 * ramp(f, betul, on - 2);
  if (f >= on) level = Math.max(0.08, 0.3 - 0.22 * ramp(f, on, on + 6));
  const flick = f >= on && f < on + 12 && Math.floor((f - on) / 2) % 2 === 0;
  const bg = mixColor(C.cream, NIGHT, 0.42);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 940]}
      decor={<Decor seed="s3" f={f} kind="dots" colors={[C.white]} opacity={0.12} />}
      keys={
        <>
          <At y={175} style={{ gap: 26 }}>
            <Kinetic text="OTAK" at={otak} f={f} size={130} color={C.white} stroke={C.ink} strokeW={10} depth={8} />
            <Kinetic text="BELUM" at={belum} f={f} size={130} color={C.white} stroke={C.ink} strokeW={10} depth={8} />
          </At>
          <At y={330} style={{ gap: 24 }}>
            <Kinetic text="BETUL-BETUL" at={betul} f={f} size={96} color={C.yellow} stroke={C.ink} strokeW={9} stagger={0.9} />
            <Kinetic text="ON" at={on} f={f} size={130} mode="slam" color={C.coral} stroke={C.ink} strokeW={11} depth={9} />
          </At>
        </>
      }
    >
      <Floor y={1176} color={C.ink} />
      <Stage>
        <InBed
          x={CX}
          y={1040}
          t={f}
          blanketTop={60}
          handsOnBlanket={false}
          otakDy={-40}
          eyes="open"
          droop={0.62 + 0.08 * Math.sin(f * 0.1)}
          mouth={shh ? "o" : "wavy"}
          look={[0.15, 0.5]}
          nightcap={1}
          otakLean={Math.sin(f * 0.07) * 3}
          lh={[40, 400]}
          rh={rh}
          rItem={shh && f > seb + 3 ? <Finger /> : undefined}
          squash={1 - wobble(f, seb, 0.06, 0.6, 0.2)}
        />
        {meterIn > 0.01 ? (
          <g transform={`translate(${CX - 270} 700) scale(${meterIn})`}>
            <BrainMeter level={level} blink={flick} w={400} />
          </g>
        ) : null}
        {/* sparks when the power button fails */}
        {f >= on && f < on + 12
          ? [0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M ${CX + 200 + i * 22} ${640 - i * 10} l 12 -22 l -10 4 l 12 -24`}
                stroke={C.yellow}
                strokeWidth={6}
                fill="none"
                strokeLinejoin="round"
                opacity={flick ? 1 : 0.3}
              />
            ))
          : null}
      </Stage>
    </SceneShell>
  );
};

// "Orang panggil sleep inertia... rasa mamai lepas bangun."  (match cut: same Si Otak spot)
export const S3bInertia: React.FC<SceneProps> = ({ f, cam }) => {
  const orang = F("orang");
  const sleep = F("sleep");
  const inertia = F("inertia");
  const mamai = F("mamai");
  const push = clamp01((f - S.s3b) / (S.s4 - S.s3b));
  const sway = Math.sin((f - orang) * 0.16) * 7;
  const fogIn = pop(f, mamai - 2, { damping: 14, stiffness: 120 });
  const bg = mixColor(C.cream, C.pink, 0.28);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 900]}
      decor={<Decor seed="s3b" f={f} kind="rays" colors={[C.pink]} opacity={0.4} cx={CX} cy={880} />}
      keys={
        <>
          <At y={160}>
            <Kinetic text="SLEEP" at={sleep} f={f} size={160} mode="slam" color={C.teal} stroke={C.ink} strokeW={12} depth={10} tilt={-3} />
          </At>
          <At y={320}>
            <Kinetic text="INERTIA" at={inertia} f={f} size={150} color={C.teal} stroke={C.ink} strokeW={12} depth={10} tilt={2} stagger={1.1} />
          </At>
          <At y={500}>
            <Kinetic text="= RASA MAMAI" at={mamai} f={f} size={92} color={C.ink} stroke={C.white} strokeW={8} stagger={1} />
          </At>
        </>
      }
    >
      <Stage>
        {fogIn > 0.01 ? (
          <g transform={`translate(${CX} 860)`}>
            <Fog s={1.6 * fogIn} t={f} opacity={0.75} />
          </g>
        ) : null}
        <OtakAt
          x={CX}
          y={1040}
          s={OS}
          t={f}
          eyes="dizzy"
          sparkleSpin={f * 3}
          mouth="wavy"
          lean={sway}
          nightcap={1}
          lh={[20 + sway * 2, 330]}
          rh={[380 + sway * 2, 330]}
          lf={[150 + sway, 446]}
          rf={[250 + sway, 446]}
          squash={1 - wobble(f, sleep, 0.1, 0.9, 0.3)}
        />
        <g transform={`translate(${CX + sway * 3} ${1040 - 430 * OS})`}>
          <DizzyOrbit t={f} rx={190} ry={44} n={5} />
        </g>
      </Stage>
    </SceneShell>
  );
};
