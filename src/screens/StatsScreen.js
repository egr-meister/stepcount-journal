// Weekly statistics — a weekly walking path. Seven-day path visualization
// (simple Views) plus quiet summary labels. No chart library.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../store';
import WeekPath from '../components/WeekPath';
import { Card, Divider } from '../components/UI';
import { colors, spacing, font, radius } from '../theme';
import {
  weeklyStats,
  computeStreaks,
  prettyDate,
  formatNumber,
} from '../logic';

export default function StatsScreen() {
  const { entries, settings } = useAppData();

  const week = useMemo(
    () => weeklyStats(entries, settings),
    [entries, settings]
  );
  const streak = useMemo(
    () => computeStreaks(entries, settings),
    [entries, settings]
  );

  const hasData = week.total > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.rangeLabel}>
          {prettyDate(week.weekStart)} – {prettyDate(week.weekEnd)}
        </Text>
        <Text style={styles.heading}>This week’s walking path</Text>

        {/* Path visualization */}
        <Card tone="paper" style={styles.pathCard}>
          <WeekPath days={week.days} maxSteps={week.maxSteps} variant="full" />
          <Divider style={{ marginTop: spacing.lg }} />
          <View style={styles.legendRow}>
            <Legend color={colors.green} label="Goal reached" />
            <Legend color={colors.sky} label="Some steps" />
            <Legend color={colors.track} label="No entry" />
          </View>
        </Card>

        {/* Summary labels */}
        <View style={styles.statGrid}>
          <StatBox
            big={formatNumber(week.total)}
            label="Total steps this week"
            tone="green"
          />
          <StatBox
            big={formatNumber(week.average)}
            label="Daily average"
            tone="sky"
          />
        </View>
        <View style={styles.statGrid}>
          <StatBox
            big={week.best ? week.best.name : '—'}
            small={week.best ? `${formatNumber(week.best.steps)} steps` : 'No steps yet'}
            label="Best day"
            tone="clay"
          />
          <StatBox
            big={`${week.goalDays} of 7`}
            label="Goal days this week"
            tone="green"
          />
        </View>

        {/* Streak summary */}
        <Card style={styles.streakCard}>
          <Text style={styles.streakTitle}>Streak</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={styles.streakNum}>{streak.current}</Text>
              <Text style={styles.streakLabel}>Current streak (days)</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakNum}>{streak.best}</Text>
              <Text style={styles.streakLabel}>Best streak (days)</Text>
            </View>
          </View>
          <Text style={styles.streakHint}>
            {streak.goalReachedToday
              ? 'You reached today’s goal. Keep your path going tomorrow.'
              : 'Reach your goal today to continue your streak.'}
          </Text>
        </Card>

        {!hasData ? (
          <Text style={styles.emptyHint}>
            No steps logged this week yet. Add entries to see your weekly path.
          </Text>
        ) : null}

        <Text style={styles.footNote}>
          Weekly statistics are calculated from your manual entries. Days with
          no entry count as 0 steps. The week starts on Monday.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function StatBox({ big, small, label, tone }) {
  const bg =
    tone === 'sky'
      ? colors.skySoft
      : tone === 'clay'
      ? colors.claySoft
      : colors.greenSoft;
  const fg =
    tone === 'sky' ? colors.sky : tone === 'clay' ? colors.clay : colors.greenDark;
  return (
    <View style={[styles.statBox, { backgroundColor: bg }]}>
      <Text style={[styles.statBig, { color: fg }]} numberOfLines={1}>
        {big}
      </Text>
      {small ? <Text style={styles.statSmall}>{small}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  rangeLabel: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
  heading: {
    fontSize: font.heading,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  pathCard: {
    marginBottom: spacing.lg,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 9,
    marginRight: 6,
  },
  legendText: {
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
  },
  statBig: {
    fontSize: font.heading,
    fontWeight: '800',
  },
  statSmall: {
    fontSize: font.tiny,
    color: colors.textMuted,
    marginTop: 1,
  },
  statLabel: {
    fontSize: font.tiny,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  streakCard: {
    marginTop: spacing.xs,
  },
  streakTitle: {
    fontSize: font.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  streakNum: {
    fontSize: font.big,
    fontWeight: '800',
    color: colors.greenDark,
  },
  streakLabel: {
    fontSize: font.tiny,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  streakHint: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footNote: {
    fontSize: font.tiny,
    color: colors.textSoft,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
