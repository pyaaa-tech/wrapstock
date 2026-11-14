import React from "react";
import { Img, useFrame, usePlatform } from "../platform";
import { Burst, Enter } from "../motion/fx";
import { ease, lerp, ramp, spring } from "../motion/math";
import { Fit, Letters, Mask, Stretch, Words } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, Fill, Head, mono, serif } from "./kit";
import { BREATH_CENTRE } from "./10-Rest";

const at = local("brand");
export const LOGO_RATIO = 709 / 1374;

/** Gold logo with a mask-wipe reveal and a sheen that travels across the metal. */
export const Logo: React.FC<{ x: number; y: number; w: number; start: number; sheenAt: number }> = ({ x, y, w, start, sheenAt }) => {
  const f = useFrame();
  const { asset } = usePlatform();
  const h = w * LOGO_RATIO;
  const p = ramp(f, start, start + 30, ease.outExpo);
  const sheen = ramp(f, sheenAt, sheenAt + 34, ease.inOut);
  const url = `url(${asset("img/seri-lestari-logo.png")})`;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, scale: `${lerp(1.12, 1, p)}` }}>
      <Mask p={p} dir="center" style={{ position: "absolute", inset: 0 }}>
        <Img src="img/seri-lestari-logo.png" style={{ width: "100%", height: "100%", display: "block" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: url,
            maskImage: url,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            background: `linear-gradient(105deg, transparent ${sheen * 140 - 30}%, rgba(255,246,214,0.95) ${sheen * 140 - 15}%, transparent ${sheen * 140}%)`,
            mixBlendMode: "screen",
          }}
        />
      </Mask>
    </div>
  );
};

/** 57.00–62.30s · "…di Seri Lestari Spa, Batu Pahat. PM kami sekarang untuk sebarang pertanyaan atau buat tempahan." */
export const Brand: React.FC = () => {
  const f = useFrame();
  const place = ramp(f, at(58.24), at(58.24) + 24, ease.outExpo);
  const chipA = spring(f, { delay: at(60.72), stiffness: 220, damping: 12 });
  const chipB = spring(f, { delay: at(61.82), stiffness: 220, damping: 12 });
  const chip = (p: number): React.CSSProperties => ({
    ...mono(36, color.ivory),
    border: `3px solid ${color.gold}`,
    borderRadius: 999,
    padding: "26px 40px",
    scale: `${p}`,
    display: "inline-block",
  });

  return (
    <Enter kind="iris" dur={20} origin={BREATH_CENTRE} background={color.ink}>
      <Fill style={{ background: `radial-gradient(circle at 50% 34%, ${color.wine} 0%, transparent 58%)`, opacity: 0.55 * ramp(f, 6, 40) }} />
      <Head tone={color.gold} right="Batu Pahat" />

      <Logo x={90} y={420} w={900} start={at(57.46) - 6} sheenAt={at(57.9)} />
      <Burst start={at(57.46)} x={540} y={600} radius={560} count={34} dur={46} color={color.gold} shape="dash" size={6} />

      <At x={0} y={932} w={1080} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30, opacity: place }}>
        <span style={{ width: 150 * place, height: 2, background: color.gold }} />
        <span style={{ ...mono(34, color.gold), letterSpacing: `${lerp(1.1, 0.46, place)}em`, marginRight: "-0.46em" }}>Batu Pahat</span>
        <span style={{ width: 150 * place, height: 2, background: color.gold }} />
      </At>

      {/* the ask */}
      <At x={84} y={1130} style={{ overflow: "hidden", paddingBottom: 12 }}>
        <Fit width={912}>
          <Stretch size={236} wdth={96} style={{ color: color.ivory }}>
            <Letters text="PM kami" start={at(58.96)} stagger={1.6} mode="rise" stiffness={200} damping={12} />
          </Stretch>
        </Fit>
      </At>
      <At x={0} y={1296} w={1080} style={{ display: "flex", justifyContent: "center", rotate: "-4deg" }}>
        <Words text="sekarang" cues={[at(59.52)]} dur={22} style={serif(190, color.gold)} />
      </At>

      <At x={0} y={1590} w={1080} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
        <span style={chip(chipA)}>Pertanyaan</span>
        <span style={{ ...mono(30, color.gold), opacity: chipB }}>/</span>
        <span style={chip(chipB)}>Tempahan</span>
      </At>
    </Enter>
  );
};
