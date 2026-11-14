import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { f } from "./geometry";
import { TAPS } from "./timeline";
import { Background } from "./components/Background";
import { Callouts, TapRipples } from "./components/Callouts";
import { Captions } from "./components/Captions";
import { EndCard } from "./components/EndCard";
import { LeftColumn } from "./components/LeftColumn";
import { Phone } from "./components/Phone";

/**
 * Tutorial tempahan Seri Lestari Spa — 1080x1920, 30 fps, 3038 frame (101.25 s).
 * Audio ialah tuan: voiceover dimainkan 1:1 dari frame 0; semua visual di-remap mengikutnya.
 */
export const Tutorial: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <LeftColumn />
      <Phone />
      <Callouts />
      <TapRipples />
      <EndCard />
      <Captions />

      <Audio src={staticFile("voiceover.wav")} />
      {TAPS.map((t) => (
        <Sequence key={t.c} from={f(t.c)} durationInFrames={6} layout="none">
          <Audio src={staticFile("tap.wav")} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
