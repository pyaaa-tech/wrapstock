import React from "react";
import { WORDS } from "../timing";
import { C, CX, FONT_CAP, FPS, SAFE } from "../theme";
import { backOut, clamp01, pop } from "../lib/anim";
import { outline } from "./Kinetic";

// Words per caption page, in voice order. Pages follow the phrasing of the voiceover.
const PAGE_SIZES = [
  3, 2, 3, 2, 3, 4, 1, 3, 3, 2, 2, 2, 2, 2, 4, 2, 3, 3, 2, 2, 1, 2, 1, 3, 3, 2, 3, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 4, 3, 2,
];

type CapWord = { text: string; on: number; end: number };
type Page = { words: CapWord[]; on: number; off: number };

const PAGES: Page[] = (() => {
  const total = PAGE_SIZES.reduce((a, b) => a + b, 0);
  if (total !== WORDS.length) throw new Error(`Caption pages cover ${total} words, voice has ${WORDS.length}`);
  const pages: Page[] = [];
  let i = 0;
  for (const n of PAGE_SIZES) {
    const ws = WORDS.slice(i, i + n).map((w) => ({
      text: w.text.replace(/[.,]+$/, ""),
      on: Math.floor(w.s * FPS),
      end: Math.round(w.e * FPS),
    }));
    pages.push({ words: ws, on: ws[0].on, off: 0 });
    i += n;
  }
  for (let p = 0; p < pages.length; p++) {
    const lastEnd = pages[p].words[pages[p].words.length - 1].end;
    const next = p + 1 < pages.length ? pages[p + 1].on : Infinity;
    pages[p].off = Math.min(next, lastEnd + 8);
  }
  return pages;
})();

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const page = PAGES.find((p) => f >= p.on && f < p.off);
  if (!page) return null;
  const enter = clamp01((f - page.on) / 5);
  const sc = 0.82 + 0.18 * backOut(enter, 2.4);
  let active = -1;
  page.words.forEach((w, i) => {
    if (f >= w.on) active = i;
  });
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: SAFE.capCenter - 70,
        height: 140,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        columnGap: 30,
        rowGap: 0,
        transform: `translateY(${(1 - enter) * 26}px) scale(${sc})`,
        transformOrigin: `${CX - SAFE.left}px 70px`,
        fontFamily: FONT_CAP,
        fontWeight: 600,
        fontSize: 64,
        lineHeight: 1.12,
      }}
    >
      {page.words.map((w, i) => {
        const isActive = i === active;
        const next = page.words[i + 1]?.on ?? page.off;
        const on = pop(f, w.on, { damping: 10, stiffness: 260, mass: 0.5 });
        const off = isActive ? 0 : f >= next ? pop(f, next, { damping: 14, stiffness: 260, mass: 0.5 }) : 0;
        const s = f < w.on ? 1 : 1 + 0.1 * on * (1 - off);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `scale(${s}) translateY(${isActive ? -4 : 0}px)`,
              transformOrigin: "50% 60%",
              color: isActive ? C.yellow : C.white,
              textShadow: outline(9, C.ink, `0px 10px 0 ${C.ink}`),
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
