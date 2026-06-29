// Journal history — a paper walking log. Reverse chronological rows with
// date labels, step numbers, goal indicator and note previews.
// Local filter (this week / month / all) and case-insensitive note search.

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../store';
import { Pill } from '../components/UI';
import { colors, spacing, font, radius } from '../theme';
import {
  safeSteps,
  safeGoal,
  progressFor,
  sortEntriesDesc,
  filterEntries,
  searchEntries,
  relativeDate,
  dayName,
  formatNumber,
} from '../logic';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
];

export default function HistoryScreen({ navigation }) {
  const { entries, settings } = useAppData();
  const goal = safeGoal(settings);

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const filtered = filterEntries(entries, filter);
    const searched = searchEntries(filtered, query);
    return sortEntriesDesc(searched);
  }, [entries, filter, query]);

  const renderItem = ({ item }) => {
    const ep = progressFor(safeSteps(item), goal);
    return (
      <Pressable
        onPress={() =>
          navigation.navigate('Entry', { date: item.date, mode: 'edit' })
        }
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.rowMain}>
          <View style={styles.dateCol}>
            <Text style={styles.day}>{dayName(item.date, true)}</Text>
            <View
              style={[
                styles.stone,
                { backgroundColor: ep.reached ? colors.green : colors.sky },
              ]}
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.date}>{relativeDate(item.date)}</Text>
            <Text style={styles.rawDate}>{item.date}</Text>
            {item.note ? (
              <Text style={styles.note} numberOfLines={2}>
                “{item.note}”
              </Text>
            ) : (
              <Text style={styles.noteEmpty}>No note</Text>
            )}
          </View>
          <View style={styles.right}>
            <Text style={styles.steps}>{formatNumber(safeSteps(item))}</Text>
            <Text style={styles.stepsLabel}>steps</Text>
            {ep.reached ? (
              <Pill label="Goal" tone="green" />
            ) : (
              <Text style={styles.percent}>{ep.percent}%</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.controls}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search notes…"
          placeholderTextColor={colors.textSoft}
          style={styles.search}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          data.length === 0 ? styles.emptyWrap : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {query.trim()
                ? 'No notes match your search.'
                : entries.length === 0
                ? 'No step history yet.'
                : 'No entries for this range.'}
            </Text>
            <Text style={styles.emptyBody}>
              Add steps manually from the home screen to build your journal.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  search: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.green,
  },
  chipText: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.greenSoft,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCol: {
    width: 40,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  day: {
    fontSize: font.tiny,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
  },
  stone: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  date: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
  },
  rawDate: {
    fontSize: font.tiny,
    color: colors.textSoft,
    marginTop: 1,
  },
  note: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  noteEmpty: {
    fontSize: font.small,
    color: colors.textSoft,
    marginTop: spacing.xs,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  steps: {
    fontSize: font.subheading,
    fontWeight: '800',
    color: colors.text,
  },
  stepsLabel: {
    fontSize: font.tiny,
    color: colors.textSoft,
    marginBottom: 4,
  },
  percent: {
    fontSize: font.tiny,
    color: colors.textMuted,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  empty: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: font.subheading,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: font.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
