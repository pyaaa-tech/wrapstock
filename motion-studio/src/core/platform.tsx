import React, { createContext, useContext } from "react";

/**
 * PLATFORM BRIDGE
 * Scenes never import Remotion or GSAP. They ask the platform for the current frame
 * and for media primitives. Remotion supplies `useCurrentFrame()`; the website supplies
 * a GSAP-driven playhead. One storyboard, two engines.
 */
export type VideoProps = {
  src: string;
  /** seconds into the clip where playback starts */
  startAt?: number;
  rate?: number;
  style?: React.CSSProperties;
};

export type Platform = {
  /** Current frame, local to the nearest <Seq> */
  useFrame: () => number;
  Seq: React.FC<{ from: number; duration: number; name?: string; children: React.ReactNode }>;
  Video: React.FC<VideoProps>;
  Img: React.FC<{ src: string; style?: React.CSSProperties; alt?: string }>;
  /** Resolve a path inside /public */
  asset: (path: string) => string;
};

const Ctx = createContext<Platform | null>(null);
export const PlatformProvider = Ctx.Provider;

export const usePlatform = () => {
  const p = useContext(Ctx);
  if (!p) throw new Error("PlatformProvider missing");
  return p;
};

export const useFrame = () => usePlatform().useFrame();

export const Seq: Platform["Seq"] = (props) => {
  const { Seq: S } = usePlatform();
  return <S {...props} />;
};

export const Video: React.FC<VideoProps> = ({ src, ...rest }) => {
  const { Video: V, asset } = usePlatform();
  return <V src={asset(src)} {...rest} />;
};

export const Img: Platform["Img"] = ({ src, ...rest }) => {
  const { Img: I, asset } = usePlatform();
  return <I src={asset(src)} {...rest} />;
};
