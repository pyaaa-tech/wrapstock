import React from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, CX, FONT_KEY } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { backOut, clamp01, easeInCubic, easeInOutCubic, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { AlarmPing, ChartMarker, CURVE_DEEP, SleepChart } from "../components/Sets";
import { Dial, Fog } from "../components/Bedroom";
import { OtakAt } from "../components/SiOtak";

// "Lagi teruk kalau kau terbangun masa tengah tidur nyenyak. Mamai tu biasanya hilang dalam setengah jam, kadang-kadang lebih lama."
export const S4Deep: React.FC<SceneProps> = ({ f, cam }) => {
  const lagi = F("lagi3");
  const teruk = F("teruk");
  const terbangun = F("terbangun");
  const nyenyak = F("nyenyak");
  const mamai = F("mamai2");
  const hilang = F("hilang");
  const setengah = F("setengah");
  const kadang = F("kadangkadang");
  const lama = F("lama");
  const push = clamp01((f - S.s4) / (S.s5 - S.s4));
  const part2 = f >= mamai - 4;

  // ---- part 1: chart, line draws to the deepest point and the alarm hits there
  const len = getLength(CURVE_DEEP);
  // progress where the curve reaches its trough (x ~ 420)
  let pTrough = 0.45;
  for (let k = 0; k <= 200; k++) {
    const pt = getPointAtLength(CURVE_DEEP, (len * k) / 200);
    if (pt && pt.x >= 420) {
      pTrough = k / 200;
      break;
    }
  }
  const p = easeInOutCubic(ramp(f, lagi, terbangun)) * pTrough;
  const jolt = f >= terbangun ? Math.exp(-(f - terbangun) * 0.08) : 0;
  const chartOut = easeInCubic(ramp(f, mamai - 4, mamai + 2));
  const chartIn = pop(f, lagi - 1, { damping: 13, stiffness: 190 });

  // ---- part 2: dial sweeps 30 min while the fog clears; sometimes longer
  const minutes = f < hilang ? 0 : f < kadang ? 30 * easeInOutCubic(ramp(f, hilang, kadang - 2)) : 30 + 9 * easeInOutCubic(ramp(f, kadang, lama + 10));
  const fogLeft = 1 - 0.75 * clamp01(minutes / 30);
  const dialIn = pop(f, mamai, { damping: 11, stiffness: 180 });
  const clearing = minutes > 22;

  const bg = mixColor(C.cream, C.teal, 0.12);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 920]}
      decor={<Decor seed="s4" f={f} kind="squiggles" colors={[C.teal, C.pink]} opacity={0.22} />}
      keys={
        <>
          <At y={175} style={{ gap: 26 }}>
            <Kinetic text="LAGI" at={lagi} f={f} size={140} color={C.ink} stroke={C.white} strokeW={9} out={mamai - 6} />
            <Kinetic text="TERUK!" at={teruk} f={f} size={150} mode="slam" color={C.coral} stroke={C.ink} strokeW={11} depth={9} tilt={-3} out={mamai - 6} />
          </At>
          <At y={175} style={{ gap: 26 }}>
            <Kinetic text="MAMAI" at={mamai} f={f} size={116} color={C.ink} stroke={C.white} strokeW={9} />
            <Kinetic text="HILANG" at={hilang} f={f} size={116} color={C.teal} stroke={C.ink} strokeW={10} depth={8} />
          </At>
          <At y={330}>
            <Kinetic text="± 30 MINIT" at={setengah} f={f} size={150} mode="slam" color={C.yellow} stroke={C.ink} strokeW={11} depth={9} tilt={2} />
          </At>
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        {!part2 || chartOut < 1 ? (
          <g transform={`translate(${-1100 * chartOut} 0)`}>
            <SleepChart
              f={f}
              curve={CURVE_DEEP}
              p={p}
              appear={chartIn}
              deepPulse={f >= nyenyak ? 0.5 + 0.5 * Math.sin((f - nyenyak) * 0.4) : 0}
              deepLabelIn={f >= nyenyak ? 1 + wobble(f, nyenyak, 0.25, 0.9, 0.3) : 1}
              marker={(pt) => <ChartMarker pt={pt} t={f} eyes={f >= terbangun ? "dizzy" : "closed"} jolt={jolt} />}
              extra={(() => {
                const pt = getPointAtLength(CURVE_DEEP, len * p) ?? { x: 420, y: 1090 };
                return <AlarmPing x={pt.x} y={pt.y - 40} f={f} at={terbangun} />;
              })()}
            />
            {f >= terbangun ? (
              <text
                x={470}
                y={940}
                fontFamily={FONT_KEY}
                fontWeight={800}
                fontSize={110 * backOut(clamp01((f - terbangun) / 5), 2)}
                fill={C.coral}
                stroke={C.ink}
                strokeWidth={8}
                paintOrder="stroke"
              >
                !
              </text>
            ) : null}
          </g>
        ) : null}
        {part2 ? (
          <>
            <g transform={`translate(330 880) scale(${dialIn})`}>
              <Dial minutes={minutes} r={150} />
            </g>
            {minutes > 30.5 ? (
              <g transform={`translate(500 720) scale(${pop(f, kadang + 6)})`}>
                <circle r={40} fill={C.coral} stroke={C.ink} strokeWidth={7} />
                <text x={0} y={18} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={60} fill={C.white}>
                  +
                </text>
              </g>
            ) : null}
            <g transform={`translate(745 ${1176 - 440 * 0.78 + 30})`}>
              <Fog s={0.9 * fogLeft * dialIn} t={f} opacity={0.85} />
            </g>
            <OtakAt
              x={745}
              y={1170}
              s={0.78}
              t={f}
              eyes={clearing ? (f >= lama ? "open" : "open") : "dizzy"}
              droop={clearing ? (f >= kadang ? 0.45 : 0.2) : 0}
              mouth={clearing ? "smile" : "wavy"}
              nightcap={1}
              lean={clearing ? 0 : Math.sin(f * 0.16) * 6}
              squash={1 - wobble(f, mamai, 0.1, 0.9, 0.3)}
            />
          </>
        ) : null}
      </Stage>
    </SceneShell>
  );
};
