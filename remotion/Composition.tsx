import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        fontSize: 96,
        fontWeight: 700,
        opacity,
      }}
    >
      WrapStock
    </AbsoluteFill>
  );
};
