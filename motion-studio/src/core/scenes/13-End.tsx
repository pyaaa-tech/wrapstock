import React from "react";
import { useFrame } from "../platform";
import { Enter } from "../motion/fx";
import { ease, lerp, ramp, spring } from "../motion/math";
import { color, font, vf } from "../tokens";
import { At, Fill, mono } from "./kit";
import { Logo } from "./11-Brand";
import { BUBBLE_CENTRE } from "./12-Tag";

/** 68.30–70.00s · end card (held) */
export const End: React.FC = () => {
  const f = useFrame();
  const cta = spring(f, { delay: 14, stiffness: 190, damping: 12 });
  const pulse = 1 + Math.max(0, Math.sin((f - 20) / 6)) * 0.035;
  return (
    <Enter kind="iris" dur={18} origin={BUBBLE_CENTRE} background={color.ink}>
      <Fill style={{ background: `radial-gradient(circle at 50% 40%, ${color.wine} 0%, transparent 60%)`, opacity: 0.5 }} />
      <Logo x={130} y={560} w={820} start={4} sheenAt={14} />
      <At x={0} y={1120} w={1080} style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            background: color.gold,
            color: color.ink,
            borderRadius: 999,
            padding: "34px 70px 30px",
            fontFamily: font.display,
            fontVariationSettings: vf(96, 800),
            fontSize: 70,
            textTransform: "uppercase",
            lineHeight: 1,
            scale: `${lerp(0.5, 1, cta) * pulse}`,
            opacity: f >= 14 ? 1 : 0,
          }}
        >
          PM kami sekarang
        </div>
      </At>
      <At x={0} y={1296} w={1080} style={{ textAlign: "center", ...mono(27, color.gold), letterSpacing: "0.3em", opacity: ramp(f, 22, 38, ease.out) }}>
        Khas untuk Muslimah · Batu Pahat
      </At>
    </Enter>
  );
};
