import React from "react";
import { AbsoluteFill } from "remotion";
import { C, CX, FONT_CAP } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { antic, clamp01, easeOutCubic, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { InBed } from "../components/Sets";
import { GiftBox, Zzz } from "../components/Bedroom";
import { AlarmClock, SparkleStar } from "../components/Props";
import { Pt } from "../components/SiOtak";

const NIGHT = "#3A3A63";

const Moon: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(t * 0.03) * 4})`}>
    <path d="M 30 -70 A 76 76 0 1 0 30 70 A 58 58 0 1 1 30 -70 Z" fill={C.yellow} stroke={C.ink} strokeWidth={7} />
  </g>
);

// "Kenapa lima minit tidur lagi... rasa macam hadiah?"
export const S1Sleep: React.FC<SceneProps> = ({ f, cam }) => {
  const fl = Math.max(f, 0);
  const lima = F("lima");
  const lagi = F("lagi");
  const rasa = F("rasa");
  const hadiah = F("hadiah");
  const push = clamp01(fl / (S.s2 - S.s1));
  const dream = pop(fl, lima, { damping: 11, stiffness: 170 });
  const lid = fl >= hadiah ? pop(fl, hadiah, { damping: 9, stiffness: 220 }) : 0;
  const bliss = fl >= rasa;
  const bg = mixColor(C.cream, NIGHT, 0.14);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 920]}
      decor={
        <>
          <Decor seed="s1n" f={fl} kind="dots" colors={[NIGHT]} opacity={0.12} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Moon x={150} y={720} t={fl} />
            {[
              [90, 560],
              [925, 470],
              [880, 1000],
              [60, 1080],
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${fl * 2 + i * 20}) scale(${0.55 + 0.25 * Math.sin(fl * 0.15 + i)})`}>
                <SparkleStar r={20} color={C.white} />
              </g>
            ))}
          </svg>
        </>
      }
      keys={
        <>
          <At y={170} style={{ gap: 26 }}>
            <Kinetic text="5 MINIT" at={lima} f={fl} size={136} color={C.yellow} stroke={C.ink} strokeW={11} depth={9} tilt={-3} />
            <Kinetic text="LAGI..." at={lagi} f={fl} size={96} color={C.white} stroke={C.ink} strokeW={9} stagger={1.6} />
          </At>
          <At y={350}>
            <Kinetic text="= HADIAH?" at={hadiah} f={fl} size={150} mode="slam" color={C.pink} stroke={C.ink} strokeW={11} depth={9} tilt={2} />
          </At>
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        <InBed
          x={CX}
          y={1040}
          t={fl}
          eyes={bliss ? "happy" : "closed"}
          mouth={bliss ? "grin" : "smile"}
          blush={bliss ? 1 : 0.3}
          nightcap={1}
          squash={1 - wobble(fl, rasa, 0.05, 0.6, 0.15)}
        />
        <g transform={`translate(${CX + 150} 790)`}>
          <Zzz t={fl} s={1.1} opacity={1 - dream * 0.7} />
        </g>
        {/* dream bubble with the gift */}
        {dream > 0.01 ? (
          <g transform={`translate(${CX + 200} 660) scale(${dream})`}>
            {[
              [-52, 132, 12],
              [-24, 90, 18],
            ].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill={C.white} stroke={C.ink} strokeWidth={6} />
            ))}
            <path
              d="M -150 40 C -200 30, -200 -60, -140 -70 C -140 -140, -40 -160, 0 -120 C 40 -170, 150 -150, 150 -80 C 210 -70, 210 30, 150 40 C 140 100, -130 100, -150 40 Z"
              fill={C.white}
              stroke={C.ink}
              strokeWidth={8}
            />
            <g transform={`translate(-10 70) scale(0.62) rotate(${Math.sin(fl * 0.2) * 3})`}>
              <GiftBox lid={lid} t={fl} />
            </g>
          </g>
        ) : null}
      </Stage>
    </SceneShell>
  );
};

// "Alarm bunyi, terus kau cakap, Lima minit je lagi."
export const S2Alarm: React.FC<SceneProps> = ({ f, cam }) => {
  const alarm = F("alarm");
  const bunyi = F("bunyi");
  const terus = F("terus");
  const cakap = F("cakap");
  const lima = F("lima2");
  const push = clamp01((f - S.s2) / (S.s3 - S.s2));
  const BX = 380;
  const BY = 1040;
  const CXK = 830; // clock x
  const CYK = 910;
  const ringing = f < cakap;
  const slap = f >= cakap;
  // arm: rises on "terus" (anticipation), slams the button on "cakap", retracts after "Lima"
  const toDesign = (sx: number, sy: number): Pt => [(sx - BX) / 0.85 + 200, (sy - (BY + 40)) / 0.85 + 450];
  const up = toDesign(CXK - 10, CYK - 260);
  const btn = toDesign(CXK, CYK - 150);
  const rest: Pt = [200, 440];
  let rh: Pt = rest;
  if (f >= terus - 2 && f < cakap) {
    const u = easeOutCubic(ramp(f, terus - 2, terus + 8));
    rh = [rest[0] + (up[0] - rest[0]) * u, rest[1] + (up[1] - rest[1]) * u - 40 * antic(f, cakap, 4)];
  } else if (f >= cakap && f < lima + 6) {
    const u = ramp(f, cakap - 1, cakap + 1);
    rh = [up[0] + (btn[0] - up[0]) * u, up[1] + (btn[1] - up[1]) * u];
  } else if (f >= lima + 6) {
    const u = easeOutCubic(ramp(f, lima + 6, lima + 16));
    rh = [btn[0] + (rest[0] - btn[0]) * u, btn[1] + (rest[1] - btn[1]) * u];
  }
  const armOut = f >= terus - 2 && f < lima + 16;
  const clockSq = wobble(f, cakap, 0.22, 0.9, 0.3);
  const jolt = pop(f, alarm, { damping: 8, stiffness: 260 });
  const asleepAgain = f >= lima + 8;
  const redPulse = ringing ? (((f - alarm) % 8) / 8) : 0;
  const bg = mixColor(mixColor(C.cream, NIGHT, 0.1), C.coral, ringing ? 0.12 + 0.12 * (1 - redPulse) : 0);
  const bubbleIn = pop(f, lima, { damping: 12, stiffness: 180 });
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 920]}
      decor={<Decor seed="s2" f={f} kind="dots" colors={[C.coral]} opacity={0.14} />}
      keys={
        <>
          <At y={170} style={{ gap: 26 }}>
            <Kinetic text="ALARM" at={alarm} f={f} size={124} mode="slam" color={C.coral} stroke={C.ink} strokeW={11} depth={9} tilt={-3} out={cakap - 4} />
            <Kinetic text="BUNYI!" at={bunyi} f={f} size={124} color={C.white} stroke={C.ink} strokeW={10} depth={8} out={cakap - 4} />
          </At>
          <At y={200}>
            <Kinetic text="SNOOZE!" at={cakap} f={f} size={190} mode="slam" color={C.yellow} stroke={C.ink} strokeW={13} depth={11} tilt={-4} />
          </At>
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        {/* nightstand */}
        <g transform={`translate(${CXK} ${CYK + 110})`}>
          <rect x={-110} y={0} width={220} height={24} rx={8} fill="#C98B5B" stroke={C.ink} strokeWidth={8} />
          <rect x={-90} y={24} width={180} height={122} rx={8} fill="#C98B5B" stroke={C.ink} strokeWidth={8} />
          <circle cx={0} cy={84} r={9} fill={C.ink} />
        </g>
        <g transform={`translate(${CXK + (ringing ? Math.sin(f * 2.7) * 7 : 0)} ${CYK}) scale(${0.85 * (1 + clockSq * 0.6)} ${0.85 * (1 - clockSq)}) rotate(${ringing ? Math.sin(f * 2.1) * 6 : 0})`}>
          {/* snooze button on top */}
          <rect x={-34} y={-150} width={68} height={slap ? 14 : 26} rx={8} fill={C.yellow} stroke={C.ink} strokeWidth={6} />
          <AlarmClock r={95} sec={f / 15} pulse={ringing ? redPulse : 0} ring={ringing ? f : 0} />
        </g>
        {ringing
          ? [0, 1, 2, 3].map((i) => {
              const a = (-70 + i * 46) * (Math.PI / 180);
              const r = 150 + ((f * 4 + i * 9) % 30);
              return (
                <path
                  key={i}
                  d={`M ${CXK + Math.sin(a) * r} ${CYK - 30 - Math.cos(a) * r} l ${Math.sin(a) * 34} ${-Math.cos(a) * 34}`}
                  stroke={C.ink}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
              );
            })
          : null}
        <InBed
          x={BX}
          y={BY}
          t={f}
          eyes={asleepAgain ? "closed" : f >= alarm ? "shock" : "closed"}
          mouth={asleepAgain ? "smile" : slap ? "flat" : "grimace"}
          brows={asleepAgain ? "none" : "worried"}
          nightcap={1}
          otakDy={-24 * (1 - jolt) * (f < terus ? 1 : 0) + (f < alarm + 6 ? -30 * Math.sin(Math.PI * clamp01((f - alarm) / 6)) : 0)}
          squash={1 + 0.08 * (f >= alarm && f < alarm + 6 ? 1 : 0) - 0.08 * antic(f, cakap, 4)}
          rh={armOut ? rh : undefined}
          handsOnBlanket={!armOut}
          sweat={f >= alarm && f < lima ? 1 : 0}
          look={armOut ? [1, -0.4] : [0.4, -0.2]}
        />
        {asleepAgain ? (
          <g transform={`translate(${BX + 140} 830)`}>
            <Zzz t={f - lima} s={1} />
          </g>
        ) : null}
        {/* impact burst on the slap */}
        {f >= cakap && f < cakap + 10
          ? Array.from({ length: 6 }, (_, i) => {
              const d = f - cakap;
              const a = (i / 6) * Math.PI * 2;
              return (
                <path
                  key={i}
                  d={`M ${CXK + Math.cos(a) * (60 + d * 10)} ${CYK - 140 + Math.sin(a) * (40 + d * 7)} l ${Math.cos(a) * 26} ${Math.sin(a) * 18}`}
                  stroke={C.ink}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={1 - d / 10}
                />
              );
            })
          : null}
      </Stage>
      {/* sleepy speech bubble */}
      {f >= lima ? (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: 90,
              top: 660,
              transform: `scale(${bubbleIn}) rotate(-3deg)`,
              transformOrigin: "70% 100%",
              background: C.white,
              border: `7px solid ${C.ink}`,
              borderRadius: 40,
              padding: "16px 30px",
              fontFamily: FONT_CAP,
              fontWeight: 700,
              fontSize: 44,
              color: C.ink,
              boxShadow: `0 9px 0 ${C.ink}`,
              whiteSpace: "nowrap",
            }}
          >
            {"Lima minit je lagi...".slice(0, Math.max(0, Math.floor((f - lima) * 1.1) + 1))}
            <span style={{ opacity: 0 }}>{"Lima minit je lagi...".slice(Math.max(0, Math.floor((f - lima) * 1.1) + 1))}</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </SceneShell>
  );
};

