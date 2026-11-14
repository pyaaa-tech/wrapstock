import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import type { Platform } from "../core/platform";
import { STAGE } from "../core/tokens";
import { engine } from "./engine";

/** Offset of the nearest <Seq>, so scenes see local frames exactly like in Remotion. */
const Offset = createContext(0);

const useFrame = () => {
  const offset = useContext(Offset);
  return useSyncExternalStore(engine.subscribe, engine.getFrame) - offset;
};

const Seq: Platform["Seq"] = ({ from, duration, children }) => {
  const offset = useContext(Offset);
  // subscribes to a boolean, so a scene only mounts/unmounts — it does not re-render — from here
  const visible = useSyncExternalStore(engine.subscribe, () => {
    const local = engine.getFrame() - offset;
    return local >= from && local < from + duration;
  });
  return visible ? <Offset.Provider value={offset + from}>{children}</Offset.Provider> : null;
};

/** A <video> element slaved to the playhead: plays freely, re-seeks on drift or scrub. */
const Video: Platform["Video"] = ({ src, startAt = 0, rate = 1, style }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const frame = useFrame();
  const playing = useSyncExternalStore(engine.subscribe, engine.isPlaying);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const target = Math.max(0, startAt + (frame / STAGE.fps) * rate);
    v.playbackRate = rate;
    if (playing) {
      if (Math.abs(v.currentTime - target) > 0.2) v.currentTime = target;
      if (v.paused) void v.play().catch(() => undefined);
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - target) > 0.04) v.currentTime = target;
    }
  });
  return <video ref={ref} src={src} muted playsInline preload="auto" style={{ display: "block", ...style }} />;
};

export const webPlatform: Platform = {
  useFrame,
  Seq,
  Video,
  Img: ({ src, style, alt = "" }) => <img src={src} style={style} alt={alt} draggable={false} />,
  asset: (p) => `${import.meta.env.BASE_URL}${p}`,
};
