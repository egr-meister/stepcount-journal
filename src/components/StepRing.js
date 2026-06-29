// Soft circular progress ring built with react-native-svg.
// Calm, no animation. Shows progress capped at 100% but the center
// content (passed as children) can show the real numbers.

import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

export default function StepRing({
  size = 188,
  thickness = 16,
  progress = 0,
  color = colors.green,
  track = colors.track,
  children,
}) {
  const safeSize = Number(size) > 0 ? Number(size) : 188;
  const stroke = Math.max(2, Number(thickness) || 16);
  const p = Math.max(0, Math.min(1, Number(progress) || 0));

  const radius = (safeSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - p);
  const center = safeSize / 2;

  return (
    <View
      style={{
        width: safeSize,
        height: safeSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg
        width={safeSize}
        height={safeSize}
        style={{ position: 'absolute' }}
      >
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          // Start the arc at the top (12 o'clock) and fill clockwise.
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: stroke,
        }}
      >
        {children}
      </View>
    </View>
  );
}
