import React from "react";
import { C, CX, FONT_CAP } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { backOut, clamp01, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { OtakAt, Pt } from "../components/SiOtak";
import { Book, StormCloud } from "../components/Props";

const OX = CX + 150;
const OY = 1170;
const OS = 0.92;

/** Small source caption at the bottom of the keyword area. */
export const SourceCaption: React.FC<{ f: number; at: number; out?: number }> = ({ f, at, out }) => {
  const a = ramp(f, at, at + 10) * (out !== undefined ? 1 - ramp(f, out, out + 6) : 1);
  if (a <= 0) return null;
  return (
    <At y={590} style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>
      <div
        style={{
          fontFamily: FONT_CAP,
          fontWeight: 600,
          fontSize: 30,
          color: C.ink,
          background: "rgba(255,255,255,0.78)",
          border: `4px solid ${C.ink}`,
          borderRadius: 999,
          padding: "8px 26px",
          whiteSpace: "nowrap",
        }}
      >
        Pengawalan mood jangka pendek – Sirois &amp; Pychyl, 2013
      </div>
    </At>
  );
};

// "Kajian psikologi cadangkan tangguh kerja selalunya cara otak kurangkan rasa tak best sekarang."
export const S3bKajian: React.FC<SceneProps> = ({ f, cam }) => {
  const kajian = F("kajian");
  const psiko = F("psikologi");
  const tangguh = F("tangguh");
  const kerja = F("kerja");
  const otak = F("otak");
  const rasa = F("rasa2");
  const sekarang = F("sekarang");
  const push = clamp01((f - S.s3b) / (S.s3c - S.s3b));

  // glasses drop onto the face on "Kajian"
  const gl = pop(f, kajian + 2, { damping: 9, stiffness: 200 });
  // pointing: at the book first, then at himself on "otak", swat the cloud on "sekarang"
  const swat = ramp(f, sekarang - 2, sekarang + 3);
  const rh: Pt =
    f < otak
      ? [-60 - 30 * pop(f, kajian + 4), 300 + Math.sin(f * 0.2) * 6]
      : f < sekarang - 2
        ? [250 + 60 * (1 - pop(f, otak)), 150]
        : [250 + 260 * swat, 150 - 80 * Math.sin(Math.PI * swat)];
  const lh: Pt = [6, 372];

  // storm cloud "rasa tak best" appears, then gets squashed away on "sekarang"
  const cloudIn = pop(f, rasa, { damping: 10, stiffness: 180 });
  const cloudOut = ramp(f, sekarang + 2, sekarang + 9);
  const cloudS = cloudIn * (1 - backOut(cloudOut, 1.4)) + 0;
  const relieved = f >= sekarang + 6;

  const bg = mixColor(C.cream, C.teal, 0.16);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 880]}
      decor={<Decor seed="s3b" f={f} kind="squiggles" colors={[C.teal, C.pink, C.yellow]} opacity={0.28} />}
      keys={
        <>
          <At y={170}>
            <Kinetic text="KAJIAN" at={kajian} f={f} size={140} color={C.teal} stroke={C.ink} strokeW={11} depth={9} out={tangguh - 6} />
          </At>
          <At y={330}>
            <Kinetic text="PSIKOLOGI" at={psiko} f={f} size={112} color={C.ink} stroke={C.white} strokeW={8} out={tangguh - 6} />
          </At>
          <At y={170}>
            <Kinetic text="TANGGUH" at={tangguh} f={f} size={150} color={C.coral} stroke={C.ink} strokeW={11} depth={9} tilt={-2} />
          </At>
          <At y={335}>
            <Kinetic text="KERJA" at={kerja} f={f} size={150} color={C.coral} stroke={C.ink} strokeW={11} depth={9} tilt={2} />
          </At>
          <SourceCaption f={f} at={kajian + 4} />
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        {/* podium with the open book */}
        <g transform={`translate(${CX - 220} 1176)`}>
          <path d="M -120 0 L -90 -170 L 90 -170 L 120 0 Z" fill={C.coral} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <g transform={`translate(0 -170) scale(${0.62 * pop(f, kajian, { damping: 10, stiffness: 200 })})`}>
            <Book />
          </g>
        </g>
        <OtakAt
          x={OX}
          y={OY}
          s={OS}
          t={f}
          squash={1 - wobble(f, kajian + 3, 0.1, 0.9, 0.3) - wobble(f, sekarang + 2, 0.12, 0.9, 0.3)}
          lean={f < otak ? -4 : 0}
          eyes={relieved ? "happy" : "open"}
          mouth={relieved ? "grin" : f >= rasa ? "wavy" : "smile"}
          brows={f >= rasa && !relieved ? "worried" : "raised"}
          look={f < otak ? [-1, 0.2] : f < rasa ? [0, 0] : [0.6, -0.8]}
          glasses={gl}
          lh={lh}
          rh={rh}
          rItem={
            f < otak ? (
              <g>
                <path d="M 0 0 L -150 40" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
                <circle cx={-150} cy={40} r={9} fill={C.coral} stroke={C.ink} strokeWidth={4} />
              </g>
            ) : undefined
          }
        />
        {cloudS > 0.01 ? (
          <g transform={`translate(${OX + 170} ${790 - 40 * cloudOut}) scale(${cloudS * 0.82}) rotate(${cloudOut * 30})`}>
            <StormCloud t={f} />
          </g>
        ) : null}
        {/* poof */}
        {f >= sekarang + 4 && f < sekarang + 20
          ? Array.from({ length: 8 }, (_, i) => {
              const d = f - sekarang - 4;
              const a = (i / 8) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={OX + 170 + Math.cos(a) * (40 + d * 9)}
                  cy={770 + Math.sin(a) * (30 + d * 7)}
                  r={18 * (1 - d / 16)}
                  fill={C.white}
                  stroke={C.ink}
                  strokeWidth={4}
                />
              );
            })
          : null}
      </Stage>
    </SceneShell>
  );
};
