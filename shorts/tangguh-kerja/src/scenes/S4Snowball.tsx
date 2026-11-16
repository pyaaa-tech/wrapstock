import React from "react";
import { C } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { clamp01, easeOutCubic, mixColor, pop, ramp, steps, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { OtakAt } from "../components/SiOtak";
import { PressureMeter, Snowball } from "../components/Props";

const FLOOR = 1176;

// "Masalahnya, tugasan tu memang takkan hilang. Dia still tunggu. Lama-lama, tekanan jadi semakin besar."
export const S4Snowball: React.FC<SceneProps> = ({ f, cam }) => {
  const masalah = F("masalahnya");
  const tugasan = F("tugasan2");
  const takkan = F("takkan");
  const hilang = F("hilang");
  const dia = F("dia");
  const tunggu = F("tunggu");
  const lama = F("lamalama");
  const tekanan = F("tekanan");
  const semakin = F("semakin");
  const besar = F("besar");
  const push = clamp01((f - S.s4) / (S.s5 - S.s4));

  // snowball grows on each phrase (spring with overshoot)
  const growCues: [number, number][] = [
    [tugasan, 108],
    [hilang, 138],
    [lama, 166],
    [tekanan, 196],
    [semakin, 228],
    [besar, 272],
  ];
  const r = steps(f, growCues, 72, { damping: 9, stiffness: 170, mass: 0.7 });
  // rolls in from the left behind Si Otak
  const rollIn = easeOutCubic(ramp(f, masalah - 2, masalah + 16));
  const bx = -260 + (300 + 0.42 * (r - 72) - -260) * rollIn;
  const lastGrow = growCues.reduce((acc, [at]) => (f >= at ? at : acc), masalah + 16);
  const sbSq = wobble(f, masalah + 16, 0.14, 0.9, 0.3) + wobble(f, lastGrow, 0.1, 0.9, 0.3);
  const roll = (bx / (Math.PI * 2 * 80)) * 360 + (r - 72) * 0.6;
  const by = FLOOR - r * (1 - sbSq);

  // pressure meter
  const meterIn = pop(f, tekanan - 2, { damping: 10, stiffness: 190 });
  const level = steps(f, [
    [tekanan, 0.32],
    [semakin, 0.62],
    [besar, 1.0],
  ], 0.08, { damping: 8, stiffness: 160 });
  const meterShake = f >= tekanan ? Math.sin(f * 2.3) * (2 + 6 * clamp01((level - 0.3) / 0.7)) : 0;

  // Si Otak: relaxed -> senses it -> looks back -> squashed by pressure
  const scaredOf = f >= hilang;
  const lookBack = f >= dia && f < lama + 6;
  const pressure = clamp01((level - 0.08) / 0.92);
  const tremble = f >= tekanan ? Math.sin(f * 2.9) * 3 * pressure : 0;
  const sq = 1 - 0.14 * pressure - wobble(f, hilang, 0.1, 0.9, 0.3) - wobble(f, besar, 0.12, 0.9, 0.3);

  const warm = ramp(f, masalah, besar + 10);
  const bg = mixColor(C.cream, C.coral, 0.78 * warm);
  const ox = 590;
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      pushAmt={0.13}
      focus={[ox - 80, 930]}
      decor={<Decor seed="s4" f={f} kind="rays" colors={[mixColor(C.cream, C.coral, 0.3 + 0.7 * warm)]} opacity={0.28 + 0.2 * warm} cx={420} cy={900} />}
      keys={
        <>
          <At y={170}>
            <Kinetic text="TUGASAN" at={tugasan} f={f} size={150} color={C.white} stroke={C.ink} strokeW={11} depth={9} tilt={-2} />
          </At>
          <At y={340} style={{ gap: 30 }}>
            <Kinetic text="TAK" at={takkan} f={f} size={150} color={C.white} stroke={C.ink} strokeW={11} depth={9} />
            <Kinetic text="HILANG" at={hilang} f={f} size={150} mode="slam" color={C.yellow} stroke={C.ink} strokeW={11} depth={9} tilt={3} />
          </At>
        </>
      }
    >
      <Floor y={FLOOR} />
      <Stage>
        <g transform={`translate(${bx} ${by}) scale(${1 + sbSq * 0.7} ${1 - sbSq})`}>
          <Snowball r={r} roll={roll} eyes={f >= dia ? pop(f, dia, { damping: 12, stiffness: 200 }) : 0} look={1} grin={f >= tunggu ? pop(f, tunggu) : 0} />
        </g>
        {/* meter */}
        <g transform={`translate(${860 + meterShake} 1150) scale(${0.95 * meterIn})`}>
          <PressureMeter level={level} h={430} />
        </g>
        {f >= besar
          ? [0, 1, 2].map((i) => {
              const d = f - besar - i * 3;
              if (d < 0) return null;
              return (
                <circle key={i} cx={860 + (i - 1) * 30} cy={700 - d * 7} r={14 + d * 1.6} fill={C.white} stroke={C.ink} strokeWidth={4} opacity={clamp01(1 - d / 18)} />
              );
            })
          : null}
        <g transform={`translate(${tremble} 0)`}>
          <OtakAt
            x={ox}
            y={1170}
            s={0.9}
            t={f}
            squash={sq}
            lean={lookBack ? -6 : scaredOf ? 3 : -2}
            eyes={f < masalah + 8 ? "happy" : "open"}
            mouth={f < masalah + 8 ? "smile" : f >= tekanan ? "grimace" : lookBack ? "wavy" : scaredOf ? "o" : "flat"}
            brows={f >= masalah + 8 ? "worried" : "none"}
            sweat={scaredOf ? 1 : 0}
            look={lookBack ? [-1, -0.4] : [0, 0]}
            lh={f >= tekanan ? [70, 230] : [6, 372]}
            rh={f >= tekanan ? [330, 230] : [394, 372]}
          />
        </g>
      </Stage>
    </SceneShell>
  );
};
