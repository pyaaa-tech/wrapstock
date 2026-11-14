import React from "react";
import { Video, useFrame } from "../platform";
import { Enter } from "../motion/fx";
import { ease, lerp, ramp, spring } from "../motion/math";
import { Letters, Mask, Stretch, Words } from "../motion/text";
import { local } from "../storyboard";
import { color, font } from "../tokens";
import { At, BigIndex, Head, mono, serif } from "./kit";

const at = local("active");
const DAYS = ["I", "S", "R", "K", "J", "S", "A"]; // Isnin … Ahad
const CORE = [0, 2, 4]; // "3 …"
const PLUS = [1, 5]; // "… hingga 5"
const MIGRAINE_DAYS = [1, 4, 6, 9, 12, 15, 18, 22, 27];
const EASED = [4, 9, 15, 1, 22, 12]; // the days that go quiet
const ARCH = { left: 524, top: 150, width: 472, height: 880 };
const ARCH_RADIUS = "236px 236px 26px 26px";

/** 19.68–27.40s · "Kedua, kekal aktif. Senaman aerobik 3 hingga 5 kali seminggu…" */
export const Active: React.FC = () => {
  const f = useFrame();
  const three = spring(f, { delay: at(22.6), stiffness: 240, damping: 11 });
  const five = spring(f, { delay: at(23.3), stiffness: 240, damping: 11 });
  const archIn = ramp(f, 4, 30, ease.outExpo);
  const headline = (a: string, b: string) => (
    <>
      <At x={78} y={600}>
        <Mask p={ramp(f, at(20.58), at(20.58) + 14)} dir="right">
          <Stretch size={196} wdth={96} style={{ color: a }}>
            kekal
          </Stretch>
        </Mask>
      </At>
      <At x={70} y={772}>
        <Stretch size={300} wdth={104} style={{ color: b }}>
          <Letters text="aktif" start={at(21.04)} stagger={2} mode="drop" stiffness={210} damping={9} />
        </Stretch>
      </At>
    </>
  );

  return (
    <Enter kind="wipeLeft" dur={14} background={color.sage}>
      <Head tone={color.ink} right="Tabiat 02 / 03" />
      <BigIndex n="02" stroke={color.ink} start={2} />
      <At x={84} y={520} style={{ ...mono(28, color.ink), opacity: ramp(f, at(19.76), at(19.76) + 10) }}>
        Kedua
      </At>

      {/* arch of footage — bodies reaching up */}
      <Mask p={archIn} dir="up" style={{ position: "absolute", ...ARCH }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: ARCH_RADIUS, overflow: "hidden", background: color.sageDeep }}>
          <Video src="video/yoga.mp4" startAt={0.4} style={{ width: "100%", height: "100%", objectFit: "cover", scale: `${lerp(1.2, 1.04, ramp(f, 0, 230, ease.out))}`, transformOrigin: "50% 30%", filter: "saturate(0.82) contrast(1.04)" }} />
        </div>
      </Mask>

      {/* KEKAL AKTIF — ink on the ground, ivory wherever it crosses the footage */}
      {headline(color.ink, color.burgundy)}
      <Mask p={archIn} dir="up" style={{ position: "absolute", ...ARCH }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: ARCH_RADIUS, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: -ARCH.left, top: -ARCH.top, width: 1080, height: 1920 }}>{headline(color.ivory, color.ivory)}</div>
        </div>
      </Mask>

      {/* 3–5× seminggu */}
      <At y={1096}>
        <Words text="Senaman aerobik" cues={[at(21.68), at(22.16)]} dur={12} style={mono(28, color.ink)} />
      </At>
      <At x={78} y={1140} style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <Stretch size={186} wdth={100} style={{ color: color.ink, scale: `${lerp(0.3, 1, three)}`, opacity: f >= at(22.6) ? 1 : 0, transformOrigin: "50% 100%" }}>
          3
        </Stretch>
        <Stretch size={186} wdth={100} style={{ color: color.ink, scale: `${lerp(0.3, 1, five)}`, opacity: f >= at(23.3) ? 1 : 0, transformOrigin: "0% 100%" }}>
          –5×
        </Stretch>
        <div style={{ marginLeft: 26, marginBottom: 6 }}>
          <Words text="seminggu" cues={[at(23.78)]} dur={16} style={serif(112, color.burgundy)} />
        </div>
      </At>
      <At y={1338} w={912} style={{ display: "flex", justifyContent: "space-between" }}>
        {DAYS.map((d, i) => {
          const appear = spring(f, { delay: at(21.9) + i * 2, stiffness: 220, damping: 14 });
          const k = CORE.indexOf(i), k2 = PLUS.indexOf(i);
          const fill = k >= 0 ? spring(f, { delay: at(22.6) + k * 3, stiffness: 260, damping: 11 }) : k2 >= 0 ? spring(f, { delay: at(23.3) + k2 * 4, stiffness: 260, damping: 11 }) : 0;
          return (
            <div key={i} style={{ position: "relative", width: 104, height: 104, borderRadius: 999, border: `3px solid ${color.ink}`, scale: `${appear}`, display: "grid", placeItems: "center" }}>
              <div style={{ position: "absolute", inset: -3, borderRadius: 999, background: k >= 0 ? color.ink : color.burgundy, scale: `${fill}` }} />
              <span style={{ position: "relative", fontFamily: font.mono, fontWeight: 700, fontSize: 36, color: fill > 0.5 ? color.ivory : color.ink }}>{d}</span>
            </div>
          );
        })}
      </At>

      {/* a month: migraine days fall quiet */}
      <At y={1496} w={912} style={{ display: "flex", justifyContent: "space-between", ...mono(24, color.ink), opacity: ramp(f, at(25.74), at(25.74) + 10) }}>
        <span>Hari migrain / sebulan</span>
        <span style={{ translate: `0 ${Math.sin(f / 5) * 4}px`, fontWeight: 700 }}>↓</span>
      </At>
      <At y={1546} w={912} style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 13 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const appear = ramp(f, at(24.26) + i * 0.7, at(24.26) + i * 0.7 + 10, ease.outExpo);
          const isM = MIGRAINE_DAYS.includes(i);
          const e = EASED.indexOf(i);
          const heal = e >= 0 ? ramp(f, at(25.18) + e * 8, at(25.18) + e * 8 + 12, ease.inOut) : 0;
          return (
            <div key={i} style={{ height: 62, borderRadius: 12, border: `3px solid ${color.ink}`, opacity: appear, position: "relative", overflow: "hidden", scale: `1 ${1 - Math.sin(heal * Math.PI) * 0.5}` }}>
              {isM && <div style={{ position: "absolute", inset: 0, background: color.vermilion, translate: `0 ${heal * 105}%` }} />}
            </div>
          );
        })}
      </At>
    </Enter>
  );
};
