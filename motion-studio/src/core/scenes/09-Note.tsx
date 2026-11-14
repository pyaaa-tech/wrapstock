import React from "react";
import { useFrame } from "../platform";
import { Draw, Enter } from "../motion/fx";
import { ease, ramp, spring } from "../motion/math";
import { Mask, Typewriter, Words } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, Head, mono, serif, text } from "./kit";

const at = local("note");

/** 47.56–50.96s · "Ingat, ini perkongsian untuk tujuan pendidikan sahaja." */
export const Note: React.FC = () => {
  const f = useFrame();
  const star = spring(f, { delay: 2, stiffness: 120, damping: 12 });
  return (
    <Enter kind="wipeUp" dur={12} background={color.ink}>
      <Head tone={color.ivory} right="Nota" />
      {/* a slow asterisk — the footnote mark */}
      <svg style={{ position: "absolute", left: 720, top: 400, rotate: `${f * 0.9}deg`, scale: `${star}` }} width="260" height="260" viewBox="-130 -130 260 260">
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x={-14} y={-120} width={28} height={240} rx={14} fill={color.sage} transform={`rotate(${a})`} />
        ))}
      </svg>
      <At y={480}>
        <Typewriter text="Nota kaki" start={4} cps={20} cursor={false} style={mono(28, color.sage)} />
      </At>
      <At y={640}>
        <Mask p={ramp(f, at(47.64), at(47.64) + 22, ease.outExpo)} dir="up" style={{ padding: "50px 20px 30px 0" }}>
          <div style={serif(280, color.ivory)}>Ingat,</div>
        </Mask>
      </At>
      <At y={1070} w={912}>
        <Words text="ini perkongsian untuk tujuan" cues={[at(48.26), at(48.6), at(49.2), at(49.44)]} dur={14} style={text(64, color.ivory, 400)} />
      </At>
      <At y={1190}>
        <Words text="pendidikan" cues={[at(49.84)]} dur={20} style={serif(190, color.sage)} />
        <svg width="800" height="50" viewBox="0 0 800 50" style={{ marginTop: 4 }}>
          <Draw d="M6 30 C120 4 200 50 330 26 S560 6 794 28" p={ramp(f, at(49.84) + 6, at(49.84) + 26, ease.inOut)} stroke={color.sage} strokeWidth={7} strokeLinecap="round" />
        </svg>
      </At>
      <At y={1480}>
        <Words text="sahaja." cues={[at(50.36)]} dur={16} style={text(64, color.ivory, 400)} />
      </At>
    </Enter>
  );
};
