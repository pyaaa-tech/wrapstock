import React from "react";
import { Video, useFrame } from "../platform";
import { Camera, Enter, Tilt3D } from "../motion/fx";
import { ease, lerp, ramp, spring } from "../motion/math";
import { Mask, Stretch, Words } from "../motion/text";
import { local, sceneFrames, SCENES, OVERLAP } from "../storyboard";
import { color, font, vf } from "../tokens";
import { At, Head, mono, serif, text } from "./kit";
import { SEED_DOT } from "./02-Stat";

const at = local("pivot");
const DUR = sceneFrames(SCENES[2]).duration - OVERLAP;

/** 8.70–13.72s · "Tapi tahukah anda, ada 3 tabiat yang boleh membantu mengurangkan serangan migrain?" */
export const Pivot: React.FC = () => {
  const f = useFrame();
  const three = spring(f, { delay: at(10.54) - 3, stiffness: 120, damping: 11 });
  const tape = spring(f, { delay: at(10.86), stiffness: 150, damping: 13 });
  const push = ramp(f, DUR - 12, DUR + OVERLAP, ease.in); // camera dives into the numeral on exit
  const settle = ramp(f, at(10.02), at(10.54) + 4, ease.inOut);
  const box = { left: 110, top: 470, width: 860, height: 1010 };

  return (
    <Enter kind="iris" dur={18} origin={SEED_DOT} background={color.ivory}>
      <Camera zoom={1 + push * 1.6} origin="50% 52%">
        <Head tone={color.burgundy} right="Tabiat" />
        <At y={176} w={912} style={{ translate: `0 ${lerp(470, 0, settle)}px`, scale: `${lerp(1.3, 1, settle)}`, transformOrigin: "0 0" }}>
          <Words text="Tapi tahukah anda?" cues={[at(8.76), at(9.32), at(9.8)]} dur={18} style={serif(134, color.burgundy)} />
        </At>
        <At x={760} y={470} style={{ ...mono(26, color.burgundy), opacity: ramp(f, at(10.02), at(10.02) + 8) }}>
          ada —
        </At>

        {/* the numeral is a window onto the footage */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <clipPath id="clip-three" clipPathUnits="userSpaceOnUse">
              <text x={box.width / 2} y={930} textAnchor="middle" style={{ fontFamily: font.display, fontVariationSettings: vf(112, 900), fontSize: 1240 }}>
                3
              </text>
            </clipPath>
          </defs>
        </svg>
        {/* swings in on its vertical axis, like a door opening onto the answer */}
        <Tilt3D
          ry={lerp(-78, 0, three)}
          rz={lerp(-6, 0, three)}
          perspective={1600}
          style={{ position: "absolute", ...box, opacity: f >= at(10.54) - 3 ? 1 : 0, scale: `${lerp(0.7, 1, three)}`, transformOrigin: "50% 55%" }}
        >
          <div style={{ position: "absolute", inset: 0, clipPath: "url(#clip-three)", background: color.burgundy }}>
            <Video src="video/headache.mp4" startAt={0.6} style={{ width: "100%", height: "100%", objectFit: "cover", scale: `${lerp(1.25, 1.08, ramp(f, at(10.54), DUR, ease.out))}`, filter: "saturate(0.8) contrast(1.05)" }} />
            <div style={{ position: "absolute", inset: 0, background: color.burgundy, mixBlendMode: "soft-light", opacity: 0.55 }} />
          </div>
        </Tilt3D>

        {/* TABIAT — a strip of tape across the numeral */}
        <Mask p={tape} dir="right" style={{ position: "absolute", left: -60, top: 1150, width: 1200, rotate: "-5deg" }}>
          <div style={{ background: color.burgundy, padding: "26px 0 14px", display: "flex", justifyContent: "center" }}>
            <Stretch size={178} wdth={lerp(50, 118, tape)} style={{ color: color.ivory }}>
              tabiat
            </Stretch>
          </div>
        </Mask>

        <At y={1590} w={912}>
          <Words
            text="yang boleh membantu mengurangkan serangan migrain."
            cues={[at(11.36), at(11.52), at(11.72), at(12.28), at(12.92), at(13.24)]}
            dur={14}
            style={text(58, color.burgundy, 500)}
            accent={{ 3: { fontWeight: 800 } }}
          />
        </At>
      </Camera>
    </Enter>
  );
};
