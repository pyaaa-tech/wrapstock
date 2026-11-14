import React from "react";
import { useFrame } from "../platform";
import { Draw, Enter } from "../motion/fx";
import { ease, lerp, ramp, spring } from "../motion/math";
import { Fit, Mask, Stretch, Typewriter, Words } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, Head, mono, serif, text } from "./kit";

const at = local("tag");
export const BUBBLE_CENTRE: [number, number] = [540, 1560];

/** 62.30–68.30s · "Oh, lupa. Seri Lestari Spa hanya untuk Muslimah sahaja, ya? Saya share pengetahuan sahaja." */
export const Tag: React.FC = () => {
  const f = useFrame();
  const oh = spring(f, { delay: at(62.38), stiffness: 170, damping: 7 }); // deliberately wobbly — an afterthought
  const hl = ramp(f, at(65.04) - 2, at(65.04) + 14, ease.outExpo);
  const mus = spring(f, { delay: at(65.04), stiffness: 150, damping: 10 });
  const bubble = spring(f, { delay: at(66.18) - 4, stiffness: 180, damping: 19 });
  const wink = ramp(f, at(67.6), at(67.6) + 12, ease.inOut);

  return (
    <Enter kind="diagonal" dur={16} background={color.ivory}>
      <Head tone={color.burgundy} right="P.S." />
      <At x={76} y={210} style={{ rotate: `${lerp(-16, -3, oh)}deg`, scale: `${lerp(0.4, 1, oh)}`, transformOrigin: "10% 90%", opacity: f >= at(62.38) ? 1 : 0 }}>
        <div style={serif(360, color.burgundy)}>Oh,</div>
      </At>
      <At x={540} y={404}>
        <Words text="lupa —" cues={[at(62.78), at(62.78) + 8]} dur={18} style={serif(190, color.burgundy)} />
      </At>

      <At y={720}>
        <Typewriter text="Seri Lestari Spa" start={at(63.42)} cps={18} cursor={false} style={{ ...mono(34, color.burgundy), fontWeight: 700 }} />
      </At>
      <At y={794}>
        <Words text="hanya untuk" cues={[at(64.6), at(64.76)]} dur={14} style={text(80, color.burgundy, 500)} />
      </At>
      <At x={64} y={908}>
        <Mask p={hl} dir="right" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, background: color.sage }} >
          <span />
        </Mask>
        <div style={{ position: "relative", padding: "26px 22px 8px", width: 952, height: 222, boxSizing: "border-box" }}>
          <Fit width={908} align="bottom" style={{ position: "absolute", left: 22, bottom: 8 }}>
            <Stretch size={212} wdth={lerp(150, 92, mus)} style={{ color: color.burgundy, opacity: f >= at(65.04) ? 1 : 0 }}>
              Muslimah
            </Stretch>
          </Fit>
        </div>
      </At>
      <At y={1140}>
        <Words text="sahaja, ya?" cues={[at(65.52), at(65.94)]} dur={18} style={serif(184, color.burgundy)} accent={{ 1: { rotate: `${Math.sin(f / 7) * 4}deg` } }} />
      </At>

      {/* the narrator's aside */}
      <At x={84} y={1440} w={912} style={{ scale: `${bubble}`, transformOrigin: "8% 100%", opacity: f >= at(66.18) - 4 ? 1 : 0 }}>
        <div style={{ background: color.ink, borderRadius: "44px 44px 44px 8px", padding: "46px 50px 50px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, minHeight: 150 }}>
          <Typewriter text={"Saya share\npengetahuan sahaja."} start={at(66.18)} cps={20} style={{ fontSize: 44, lineHeight: 1.35, color: color.ivory }} />
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ flex: "none", scale: `${spring(f, { delay: at(67.48), stiffness: 220, damping: 10 })}` }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke={color.sage} strokeWidth="7" />
            <circle cx="42" cy="48" r="7" fill={color.sage} />
            <path d={`M70 ${lerp(48, 50, wink)} q9 ${lerp(-9, 2, wink)} 18 0`} fill="none" stroke={color.sage} strokeWidth="7" strokeLinecap="round" />
            <Draw d="M36 72 q24 24 48 0" p={ramp(f, at(67.48) + 4, at(67.48) + 16)} stroke={color.sage} strokeWidth={7} strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ ...mono(22, color.sageDeep), marginTop: 18 }}>— suara latar</div>
      </At>
    </Enter>
  );
};
