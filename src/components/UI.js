// Small shared UI building blocks for the calm journal look.

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, font } from '../theme';

export function Card({ style, children, tone = 'sand' }) {
  const bg =
    tone === 'paper'
      ? colors.cardAlt
      : tone === 'green'
      ? colors.greenSoft
      : colors.card;
  return <View style={[styles.card, { backgroundColor: bg }, style]}>{children}</View>;
}

export function PrimaryButton({ label, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.primaryDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, tone = 'default', style }) {
  const color =
    tone === 'danger' ? colors.danger : colors.greenDark;
  const border =
    tone === 'danger' ? colors.dangerSoft : colors.greenSoft;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghost,
        { borderColor: border },
        pressed && styles.pressed,
        style,
      ]}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
    >
      <Text style={[styles.ghostText, { color }]}>{label}</Text>
    </Pressable>
  );
}

// A short row of step dots — gentle decorative path marker.
export function PathDots({ count = 5, color = colors.green, size = 7 }) {
  const dots = [];
  for (let i = 0; i < count; i += 1) {
    const c = i % 3 === 0 ? colors.sky : i % 3 === 1 ? color : colors.clay;
    dots.push(
      <View
        key={i}
        style={{
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: c,
          marginHorizontal: 3,
          marginTop: i % 2 === 0 ? 0 : 4,
        }}
      />
    );
  }
  return <View style={styles.dots}>{dots}</View>;
}

export function Pill({ label, tone = 'green' }) {
  const map = {
    green: { bg: colors.greenSoft, fg: colors.greenDark },
    sky: { bg: colors.skySoft, fg: colors.sky },
    clay: { bg: colors.claySoft, fg: colors.clay },
    muted: { bg: colors.track, fg: colors.textMuted },
  };
  const c = map[tone] || map.green;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.pillText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.green} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  primary: {
    backgroundColor: colors.green,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: {
    backgroundColor: colors.track,
  },
  primaryText: {
    color: colors.white,
    fontSize: font.subheading,
    fontWeight: '700',
  },
  ghost: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontSize: font.subheading,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: font.tiny,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default {
  Card,
  PrimaryButton,
  GhostButton,
  PathDots,
  Pill,
  Divider,
  Loading,
};
