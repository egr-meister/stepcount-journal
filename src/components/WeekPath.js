// Seven-day walking path made of simple Views (no chart library).
// Each day is a "stone" sitting on a path line; its bar height reflects
// steps relative to the best day, and it turns green when the goal is met.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, font } from '../theme';
import { todayISO } from '../logic';

export default function WeekPath({
  days = [],
  maxSteps = 0,
  variant = 'preview', // 'preview' (home) or 'full' (stats)
}) {
  const list = Array.isArray(days) ? days : [];
  const max = Math.max(Number(maxSteps) || 0, 1);
  const barMax = variant === 'full' ? 120 : 64;
  const today = todayISO();

  return (
    <View style={styles.row}>
      {list.map((d, i) => {
        const steps = Math.max(0, Number(d?.steps) || 0);
        const h = steps > 0 ? Math.max(8, (steps / max) * barMax) : 6;
        const reached = !!d?.reached;
        const isToday = d?.date === today;
        const stoneColor = reached
          ? colors.green
          : steps > 0
          ? colors.sky
          : colors.track;

        return (
          <View key={d?.date || i} style={styles.col}>
            <View style={[styles.barArea, { height: barMax }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: stoneColor,
                    width: variant === 'full' ? 22 : 14,
                  },
                ]}
              />
            </View>
            {/* path stone */}
            <View
              style={[
                styles.stone,
                {
                  backgroundColor: stoneColor,
                  borderColor: isToday ? colors.greenDark : 'transparent',
                  borderWidth: isToday ? 2 : 0,
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                isToday && { color: colors.greenDark, fontWeight: '700' },
              ]}
            >
              {(d?.shortName || '').slice(0, 1)}
            </Text>
            {variant === 'full' && (
              <Text style={styles.stepLabel}>
                {steps > 0 ? formatShort(steps) : '0'}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function formatShort(n) {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `${n}`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  barArea: {
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  bar: {
    borderRadius: radius.pill,
  },
  stone: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  label: {
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  stepLabel: {
    fontSize: font.tiny,
    color: colors.textSoft,
    marginTop: 2,
  },
});
