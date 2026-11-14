import React from "react";
import { spring, useCurrentFrame } from "remotion";
import { BEZEL, FPS, H, K, SCREEN, W } from "../geometry";
import { lotusRosette, wipeGeom } from "../petal";
import { C, rgba } from "../theme";
import {
  SCENES,
  cameraAt,
  sceneIndexAt,
  segAt,
  srcTime,
  wipeProgress,
} from "../timeline";
import { RemapVideo } from "./RemapVideo";

const VIDEO_STYLE: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  width: SCREEN.w,
  height: SCREEN.h,
};

/** Satu babak dalam skrin: frame semasa + (semasa speed ramp) dua gema frame terdahulu = motion trail. */
const SceneLayer: React.FC<{ sceneIdx: number; frame: number }> = ({
  sceneIdx,
  frame,
}) => {
  const scene = SCENES[sceneIdx];
  const c = frame / FPS;
  const seg = segAt(scene, c);
  const ghosts = seg.ramp ? [1, 2].filter((n) => c - n / FPS >= seg.c0) : [];
  return (
    <>
      <RemapVideo
        clip={scene.clip}
        kind="rec"
        srcTime={srcTime(scene, c)}
        style={VIDEO_STYLE}
      />
      {ghosts.map((n) => (
        <div
          key={n}
          style={{
            position: "absolute",
            inset: 0,
            opacity: n === 1 ? 0.32 : 0.16,
          }}
        >
          <RemapVideo
            clip={scene.clip}
            kind="rec"
            srcTime={srcTime(scene, c - n / FPS)}
            style={VIDEO_STYLE}
          />
        </div>
      ))}
    </>
  );
};

/** Bingkai telefon sendiri: rect bulat, bezel espresso, garis emas halus, tiada jenama. */
export const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const cur = sceneIndexAt(frame);
  const p = cur > 0 ? wipeProgress(SCENES[cur].start, frame) : 1;
  const wiping = p < 1;
  const cam = cameraAt(frame);
  const [ox, oy] = SCENES[cur].origin;
  const cx = ox * K;
  const cy = oy * K;
  const g = wipeGeom(SCREEN.x + cx, SCREEN.y + cy, p, W, H);
  const d = wiping ? lotusRosette(cx, cy, g.R, g.rot) : "";
  const enter = spring({
    frame,
    fps: FPS,
    config: { damping: 200 },
    durationInFrames: 18,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: SCREEN.x - BEZEL,
        top: SCREEN.y - BEZEL,
        width: SCREEN.w + BEZEL * 2,
        height: SCREEN.h + BEZEL * 2,
        borderRadius: 60,
        backgroundColor: C.espresso,
        boxShadow: `0 0 0 1.5px ${rgba(C.gold, 0.6)}, 0 50px 90px ${rgba("#000000", 0.5)}, inset 0 0 0 2px ${rgba(
          C.cream,
          0.07,
        )}`,
        translate: `0px ${(1 - enter) * 26}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: BEZEL,
          top: BEZEL,
          width: SCREEN.w,
          height: SCREEN.h,
          borderRadius: 48,
          overflow: "hidden",
          backgroundColor: C.blush,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "0 0",
            transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.z})`,
          }}
        >
          {wiping ? <SceneLayer sceneIdx={cur - 1} frame={frame} /> : null}
          {/* rim emas: stroke di BAWAH lapisan masuk, jadi hanya tepi luar siluet teratai yang kelihatan */}
          {wiping ? (
            <svg
              width={SCREEN.w}
              height={SCREEN.h}
              style={{ position: "absolute", inset: 0, overflow: "hidden" }}
            >
              <path
                d={d}
                fill="none"
                stroke={C.gold}
                strokeWidth={7}
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: wiping ? `path('${d}')` : undefined,
            }}
          >
            <SceneLayer sceneIdx={cur} frame={frame} />
          </div>
        </div>
      </div>
    </div>
  );
};
