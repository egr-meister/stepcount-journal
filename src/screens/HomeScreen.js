// Daily Step Journal home — manual-entry-first layout.
// Compact header -> today's progress card with integrated entry button ->
// weekly path preview -> streak note -> recent journal rows.

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../store';
import StepRing from '../components/StepRing';
import WeekPath from '../components/WeekPath';
import { Card, Pill, PathDots } from '../components/UI';
import { colors, spacing, font, radius } from '../theme';
import {
  todayISO,
  getEntryForDate,
  safeSteps,
  safeGoal,
  progressFor,
  weeklyStats,
  computeStreaks,
  sortEntriesDesc,
  relativeDate,
  formatNumber,
} from '../logic';

export default function HomeScreen({ navigation }) {
  const { entries, settings } = useAppData();
  const compact = !!settings?.compactMode;
  const { width } = useWindowDimensions();

  const today = todayISO();
  const goal = safeGoal(settings);

  const todayEntry = useMemo(
    () => getEntryForDate(entries, today),
    [entries, today]
  );
  const steps = safeSteps(todayEntry);
  const hasToday = !!todayEntry;
  const prog = progressFor(steps, goal);

  const week = useMemo(
    () => weeklyStats(entries, settings),
    [entries, settings]
  );
  const streak = useMemo(
    () => computeStreaks(entries, settings),
    [entries, settings]
  );
  const recent = useMemo(
    () => sortEntriesDesc(entries).slice(0, 4),
    [entries]
  );

  const ringSize = Math.min(width - 140, compact ? 150 : 188);

  const goToToday = () =>
    navigation.navigate('Entry', { date: today, mode: hasToday ? 'edit' : 'add' });

  const progressText = !hasToday
    ? 'No steps entered yet'
    : prog.reached
    ? 'Goal reached'
    : `${prog.percent}% of today's goal`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>StepCount Journal</Text>
            <Text style={styles.appSubtitle}>Manual step tracker</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            hitSlop={10}
            style={({ pressed }) => [styles.gear, pressed && { opacity: 0.6 }]}
            accessibilityLabel="Settings"
          >
            <View style={styles.gearDot} />
            <View style={[styles.gearDot, { marginTop: 3 }]} />
            <View style={[styles.gearDot, { marginTop: 3 }]} />
          </Pressable>
        </View>

        <View style={styles.manualTag}>
          <PathDots count={4} size={6} />
          <Text style={styles.manualTagText}>
            Manual entry · no automatic step counting
          </Text>
        </View>

        {/* Today's progress card with integrated entry action */}
        <Card tone="paper" style={styles.todayCard}>
          <View style={styles.todayHeaderRow}>
            <Text style={styles.todayLabel}>Today</Text>
            <Text style={styles.todayDate}>{relativeDate(today)}</Text>
          </View>

          <View style={styles.ringWrap}>
            <StepRing
              size={ringSize}
              thickness={15}
              progress={prog.ratio}
              color={prog.reached ? colors.green : colors.sky}
            >
              <Text style={styles.ringSteps}>{formatNumber(steps)}</Text>
              <Text style={styles.ringOf}>of {formatNumber(goal)} steps</Text>
            </StepRing>
          </View>

          <Text
            style={[
              styles.progressText,
              prog.reached && { color: colors.greenDark },
            ]}
          >
            {progressText}
          </Text>

          {hasToday && todayEntry?.note ? (
            <View style={styles.noteRow}>
              <View style={styles.noteMark} />
              <Text style={styles.noteText} numberOfLines={2}>
                {todayEntry.note}
              </Text>
            </View>
          ) : !hasToday ? (
            <Text style={styles.emptyHint}>Add today's steps manually.</Text>
          ) : null}

          <Pressable
            onPress={goToToday}
            style={({ pressed }) => [
              styles.entryButton,
              pressed && { opacity: 0.8 },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
          >
            <Text style={styles.entryButtonText}>
              {hasToday ? 'Edit today’s steps' : 'Add today’s steps'}
            </Text>
          </Pressable>
        </Card>

        {/* Weekly path preview */}
        <Pressable onPress={() => navigation.navigate('Stats')}>
          <Card style={styles.weekCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>This week</Text>
              <Text style={styles.linkText}>View stats ›</Text>
            </View>
            <WeekPath days={week.days} maxSteps={week.maxSteps} variant="preview" />
            <View style={styles.weekSummaryRow}>
              <Text style={styles.weekSummary}>
                {formatNumber(week.total)} steps
              </Text>
              <Text style={styles.weekSummaryMuted}>
                Goal days {week.goalDays} of 7
              </Text>
            </View>
          </Card>
        </Pressable>

        {/* Streak note (quiet, not a reward badge) */}
        <View style={styles.streakRow}>
          <View style={styles.streakLine} />
          <Text style={styles.streakText}>
            {streak.current > 0
              ? `Current streak: ${streak.current} ${
                  streak.current === 1 ? 'day' : 'days'
                }`
              : 'Reach your goal today to start a streak.'}
            {streak.best > 0 ? `   ·   Best: ${streak.best}` : ''}
          </Text>
        </View>

        {/* Recent entries as journal rows */}
        <View style={styles.recentHeaderRow}>
          <Text style={styles.cardTitle}>Recent entries</Text>
          <Pressable onPress={() => navigation.navigate('History')} hitSlop={8}>
            <Text style={styles.linkText}>History ›</Text>
          </Pressable>
        </View>

        {recent.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No steps entered today</Text>
            <Text style={styles.emptyBody}>
              Add today's steps manually to begin your journal.
            </Text>
          </Card>
        ) : (
          <View>
            {recent.map((e) => {
              const ep = progressFor(safeSteps(e), goal);
              return (
                <Pressable
                  key={e.id}
                  onPress={() =>
                    navigation.navigate('Entry', { date: e.date, mode: 'edit' })
                  }
                  style={({ pressed }) => [
                    styles.journalRow,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.journalLeft}>
                    <View
                      style={[
                        styles.rowStone,
                        {
                          backgroundColor: ep.reached
                            ? colors.green
                            : colors.sky,
                        },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowDate}>{relativeDate(e.date)}</Text>
                      {e.note ? (
                        <Text style={styles.rowNote} numberOfLines={1}>
                          {e.note}
                        </Text>
                      ) : (
                        <Text style={styles.rowNoteEmpty}>No note</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.journalRight}>
                    <Text style={styles.rowSteps}>{formatNumber(safeSteps(e))}</Text>
                    {ep.reached ? (
                      <Pill label="Goal" tone="green" />
                    ) : (
                      <Text style={styles.rowPercent}>{ep.percent}%</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() => navigation.navigate('Entry', { mode: 'add' })}
          style={({ pressed }) => [styles.addPast, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.addPastText}>+ Add steps for another day</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  appTitle: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.text,
  },
  appSubtitle: {
    fontSize: font.small,
    color: colors.greenDark,
    marginTop: 1,
    fontWeight: '600',
  },
  gear: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearDot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  manualTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  manualTagText: {
    fontSize: font.tiny,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  todayCard: {
    alignItems: 'center',
  },
  todayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  todayLabel: {
    fontSize: font.subheading,
    fontWeight: '700',
    color: colors.text,
  },
  todayDate: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  ringWrap: {
    marginVertical: spacing.lg,
  },
  ringSteps: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
  },
  ringOf: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressText: {
    fontSize: font.subheading,
    fontWeight: '600',
    color: colors.textMuted,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.claySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignSelf: 'stretch',
  },
  noteMark: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: colors.clay,
    marginRight: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: font.small,
    color: colors.text,
  },
  emptyHint: {
    fontSize: font.small,
    color: colors.textSoft,
    marginTop: spacing.xs,
  },
  entryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.green,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  entryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: font.subheading,
  },
  weekCard: {
    marginTop: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: font.subheading,
    fontWeight: '700',
    color: colors.text,
  },
  linkText: {
    fontSize: font.small,
    color: colors.greenDark,
    fontWeight: '600',
  },
  weekSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  weekSummary: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
  },
  weekSummaryMuted: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  streakLine: {
    width: 18,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.clay,
    marginRight: spacing.sm,
  },
  streakText: {
    flex: 1,
    fontSize: font.small,
    color: colors.textMuted,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
  },
  emptyBody: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  journalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.greenSoft,
  },
  journalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowStone: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: spacing.md,
  },
  rowDate: {
    fontSize: font.body,
    fontWeight: '600',
    color: colors.text,
  },
  rowNote: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowNoteEmpty: {
    fontSize: font.small,
    color: colors.textSoft,
    marginTop: 1,
    fontStyle: 'italic',
  },
  journalRight: {
    alignItems: 'flex-end',
  },
  rowSteps: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  rowPercent: {
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  addPast: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: 'dashed',
  },
  addPastText: {
    fontSize: font.small,
    color: colors.greenDark,
    fontWeight: '600',
  },
});
