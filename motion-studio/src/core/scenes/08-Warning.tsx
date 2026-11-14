import React from "react";
import { Seq, useFrame } from "../platform";
import { Camera, Draw, Enter, Trail } from "../motion/fx";
import { clamp, ease, lerp, noise, ramp, spring } from "../motion/math";
import { Fit, Glitch, Stretch, Words } from "../motion/text";
import { local, sceneFrames, SCENES } from "../storyboard";
import { color } from "../tokens";
import { At, Head, mono, serif, text } from "./kit";

const at = local("warning");
const TURN = at(45.26) - 8; // where the instruction takes over
const DUR = sceneFrames(SCENES[7]).duration;

const Instruction: React.FC = () => {
  const f = useFrame();
  const a = (s: number) => at(s) - TURN;
  const cross = ramp(f, a(45.26), a(46.28), ease.inOut);
  const fill = spring(f, { delay: a(46.28), stiffness: 200, damping: 14 });
  const hit = a(47.04);
  const push = ramp(f, hit, hit + 40, ease.out);
  return (
    <Enter kind="shutter" dur={12} background={color.ink}>
      <Camera zoom={1 + push * 0.05} origin="50% 70%">
        <Head tone={color.ivory} right="Amaran" />
        <svg style={{ position: "absolute", left: 84, top: 400 }} width="300" height="300" viewBox="0 0 300 300">
          <path d="M100 10 H200 V100 H290 V200 H200 V290 H100 V200 H10 V100 H100 Z" fill={color.vermilion} style={{ scale: `${fill}`, transformOrigin: "150px 150px", transformBox: "fill-box" as const }} opacity={f >= a(46.28) ? 1 : 0} />
          <Draw d="M100 10 H200 V100 H290 V200 H200 V290 H100 V200 H10 V100 H100 Z" p={cross} stroke={color.ivory} strokeWidth={9} strokeLinejoin="round" />
        </svg>
        <At y={800} w={912}>
          <Words text="Dapatkan rawatan perubatan dengan" cues={[a(45.26), a(45.94), a(46.28), a(46.72)]} dur={14} style={text(84, color.ivory, 600)} />
        </At>
        {/* SEGERA — arrives with a motion-blurred slam */}
        <At x={0} y={1100} w={1080} style={{ height: 500 }}>
          <Trail
            samples={5}
            step={0.7}
            render={(ff) => {
              const p = ramp(ff, hit, hit + 8, ease.outExpo);
              if (ff < hit) return null;
              return (
                <div style={{ position: "absolute", left: 72, top: 0, scale: `${lerp(2.6, 1, p)}`, transformOrigin: "50% 40%" }}>
                  <Fit width={936}>
                    <Stretch size={300} wdth={lerp(150, 62, p)} style={{ color: color.vermilion }}>
                      segera.
                    </Stretch>
                  </Fit>
                </div>
              );
            }}
          />
        </At>
      </Camera>
    </Enter>
  );
};

/** 40.74–47.56s · "Jika sakit kepala datang secara tiba-tiba dan terasa paling teruk pernah dialami, dapatkan rawatan perubatan dengan segera." */
export const Warning: React.FC = () => {
  const f = useFrame();
  const tiba = at(42.5);
  const g = clamp(1 - (f - tiba) / 22) * (f >= tiba ? 1 : 0);
  const paling = ramp(f, at(43.7), at(43.7) + 8, ease.outExpo);
  const teruk = ramp(f, at(44.04), at(44.04) + 7, ease.outExpo);
  const quake = clamp(1 - (f - at(44.04)) / 16) * (f >= at(44.04) ? 1 : 0);
  const blink = Math.floor(f / 6) % 2 === 0;

  return (
    <Enter kind="slices" dur={14} background={color.vermilion}>
      <Camera x={noise(f * 1.6, 3) * 22 * quake} y={noise(f * 1.8, 5) * 22 * quake} zoom={1 + quake * 0.03}>
        <Head tone={color.ink} right="Amaran" />
        <At y={196} style={{ ...mono(30, color.ink), fontWeight: 700, display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ width: 26, height: 26, background: color.ink, opacity: blink ? 1 : 0.15 }} /> Tanda bahaya
        </At>
        <At y={292} w={912}>
          <Words text="Jika sakit kepala datang secara" cues={[at(40.82), at(41.28), at(41.6), at(41.84), at(42.24)]} dur={12} style={text(66, color.ink, 600)} />
        </At>
        {f >= tiba && (
          <At x={76} y={486}>
            <Glitch amount={g} slices={8} ghost={color.ivory} seed={2}>
              <Fit width={928}>
                <Stretch size={236} wdth={lerp(150, 84, ramp(f, tiba, tiba + 16, ease.outExpo))} style={{ color: color.ink }}>
                  tiba-tiba
                </Stretch>
              </Fit>
            </Glitch>
          </At>
        )}
        <At y={742}>
          <Words text="dan terasa" cues={[at(43.1), at(43.34)]} dur={12} style={text(66, color.ink, 600)} />
        </At>
        {f >= at(43.7) && (
          <At x={72} y={846}>
            <Fit width={936}>
              <Stretch size={300} wdth={lerp(150, 100, paling)} style={{ color: color.ink }}>
                paling
              </Stretch>
            </Fit>
          </At>
        )}
        {f >= at(44.04) && (
          <At x={72} y={1096}>
            <Fit width={936}>
              <Stretch size={400} wdth={lerp(150, 58, teruk)} style={{ color: color.ivory }}>
                teruk
              </Stretch>
            </Fit>
          </At>
        )}
        <At y={1590}>
          <Words text="pernah dialami," cues={[at(44.46), at(44.6)]} dur={16} style={serif(120, color.ink)} />
        </At>
      </Camera>
      <Seq from={TURN} duration={DUR - TURN} name="Instruction">
        <Instruction />
      </Seq>
    </Enter>
  );
};
