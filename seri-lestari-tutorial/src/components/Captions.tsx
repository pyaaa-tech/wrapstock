import React from "react";
import type { Caption } from "@remotion/captions";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DURATION, FPS, f } from "../geometry";
import { C, SANS, rgba } from "../theme";
import { END_CARD } from "../timeline";
import wordsData from "../data/words.json";
import pagesData from "../data/pages.json";

type Word = {
  i: number;
  t: string;
  s: number;
  e: number;
  pill: number | null;
  page: number;
  line: number;
};
const WORDS = wordsData as Word[];
const PAGES = pagesData as { words: number[]; s: number; e: number }[];

/** Sama dengan public/captions.json (format Caption Remotion) — dijana oleh scripts/build_captions.py */
export const toCaption = (w: Word): Caption => ({
  text: (w.i ? " " : "") + w.t,
  startMs: Math.round(w.s * 1000),
  endMs: Math.round(w.e * 1000),
  timestampMs: Math.round((w.s + w.e) * 500),
  confidence: null,
});

// tetingkap paparan setiap halaman (frame)
const WINDOWS = PAGES.map((p, i) => {
  const start = Math.max(0, f(p.s) - 2);
  const next = PAGES[i + 1];
  let end: number;
  if (!next) end = DURATION;
  else if (next.s - p.e <= 0.95) end = Math.max(0, f(next.s) - 2);
  else end = f(p.e) + 14;
  return { start, end };
});

const FONT = 60;
const LINE = 80;
const TOP = 1352; // di bawah bingkai telefon; bawah 340 px & kanan 130 px dibiarkan bebas
const LEFT = 64;
const CENTER_X = 505;

const WordSpan: React.FC<{
  w: Word;
  frame: number;
  lastOfPage: boolean;
  nextStart: number | null;
  inPill: boolean;
}> = ({ w, frame, lastOfPage, nextStart, inPill }) => {
  const t = frame / FPS;
  const activeEnd =
    nextStart !== null
      ? nextStart
      : lastOfPage && w.i === WORDS.length - 1
        ? 1e9
        : w.e + 0.12;
  const startAt = w.i === 0 ? 0 : w.s - 0.035; // perkataan pertama menyala dari frame 0
  const active = t >= startAt && t < activeEnd - 0.035;
  const spoken = t >= activeEnd - 0.035;
  const since = frame - f(w.s - 0.035);
  const lift = active ? Math.max(0, 1 - since / 4) : 0;
  return (
    <span
      style={{
        color: active ? C.gold : C.cream,
        opacity: active || spoken ? 1 : inPill ? 0.62 : 0.46,
        textShadow: active
          ? `0 0 26px ${rgba(C.gold, 0.55)}, 0 3px 14px ${rgba(C.espresso, 0.6)}`
          : `0 3px 14px ${rgba(C.espresso, 0.6)}`,
        translate: `0px ${lift * 5}px`,
        display: "inline-block",
      }}
    >
      {w.t}
    </span>
  );
};

/** Kapsyen perkataan demi perkataan; perkataan semasa menyala emas; istilah butang sebagai pil. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = WINDOWS.findIndex((w) => frame >= w.start && frame < w.end);
  if (idx < 0) return null;
  const page = PAGES[idx];
  const words = page.words.map((i) => WORDS[i]);
  const centered = frame >= f(END_CARD.start) + 6;
  const local = frame - WINDOWS[idx].start;
  // frame 0 mesti sudah lengkap (thumbnail / hook): halaman pertama tiada animasi masuk
  const rise = WINDOWS[idx].start === 0 ? 0 : Math.max(0, 1 - local / 4);
  const lines = [0, 1]
    .map((l) => words.filter((w) => w.line === l))
    .filter((l) => l.length);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: centered ? CENTER_X - 440 : LEFT,
          top: TOP,
          width: 880,
          display: "flex",
          flexDirection: "column",
          alignItems: centered ? "center" : "flex-start",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: FONT,
          lineHeight: `${LINE}px`,
          letterSpacing: "-0.01em",
          translate: `0px ${rise * 12}px`,
          opacity: 1 - rise * 0.6,
        }}
      >
        {lines.map((lineWords, li) => {
          // kumpulkan perkataan pil yang berturutan
          const groups: { pill: number | null; ws: Word[] }[] = [];
          for (const w of lineWords) {
            const g = groups[groups.length - 1];
            if (g && g.pill !== null && g.pill === w.pill) g.ws.push(w);
            else groups.push({ pill: w.pill, ws: [w] });
          }
          return (
            <div
              key={li}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                height: LINE,
                whiteSpace: "nowrap",
              }}
            >
              {groups.map((g, gi) => {
                const spans = g.ws.map((w) => {
                  const pos = page.words.indexOf(w.i);
                  const nextIdx = page.words[pos + 1];
                  return (
                    <WordSpan
                      key={w.i}
                      w={w}
                      frame={frame}
                      lastOfPage={pos === page.words.length - 1}
                      nextStart={
                        nextIdx !== undefined ? WORDS[nextIdx].s : null
                      }
                      inPill={g.pill !== null}
                    />
                  );
                });
                if (g.pill === null)
                  return <React.Fragment key={gi}>{spans}</React.Fragment>;
                const t = frame / FPS;
                const on =
                  t >= g.ws[0].s - 0.035 && t < g.ws[g.ws.length - 1].e + 0.12;
                return (
                  <span
                    key={gi}
                    style={{
                      display: "inline-flex",
                      gap: 14,
                      alignItems: "center",
                      height: 70,
                      padding: "0 24px 2px",
                      borderRadius: 35,
                      backgroundColor: C.maroon,
                      boxShadow: `0 0 0 2px ${on ? C.gold : rgba(C.cream, 0.14)}, 0 10px 24px ${rgba(C.espresso, 0.45)}`,
                      fontSize: FONT - 4,
                    }}
                  >
                    {spans}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
