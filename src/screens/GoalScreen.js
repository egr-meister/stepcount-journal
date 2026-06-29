// Daily goal settings — edit the daily step goal or reset to default.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../store';
import { PrimaryButton, GhostButton, Card } from '../components/UI';
import { colors, spacing, font, radius } from '../theme';
import { DEFAULT_GOAL, MAX_GOAL } from '../storage';
import { safeGoal, formatNumber } from '../logic';

const PRESETS = [5000, 6000, 8000, 10000, 12000];

export default function GoalScreen({ navigation }) {
  const { settings, setGoal } = useAppData();
  const current = safeGoal(settings);

  const [goalText, setGoalText] = useState(String(current));
  const [error, setError] = useState('');

  const validate = () => {
    const trimmed = (goalText || '').trim();
    if (trimmed === '') return 'Please enter a daily goal.';
    if (!/^\d+$/.test(trimmed)) return 'Goal must be a whole number.';
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value <= 0) {
      return 'Goal must be greater than 0.';
    }
    if (value > MAX_GOAL) {
      return `Goal must not exceed ${MAX_GOAL.toLocaleString()}.`;
    }
    return '';
  };

  const onSave = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    await setGoal(Number(goalText.trim()));
    navigation.goBack();
  };

  const onReset = async () => {
    setGoalText(String(DEFAULT_GOAL));
    setError('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Daily step goal</Text>
        <Text style={styles.subheading}>
          Your goal shapes daily progress, weekly goal days, and streaks.
        </Text>

        <Card tone="paper" style={styles.card}>
          <Text style={styles.label}>Steps per day</Text>
          <TextInput
            value={goalText}
            onChangeText={(t) => {
              setGoalText(t.replace(/[^0-9]/g, '').slice(0, 6));
              if (error) setError('');
            }}
            keyboardType="number-pad"
            style={styles.input}
            placeholder={String(DEFAULT_GOAL)}
            placeholderTextColor={colors.textSoft}
          />
          <Text style={styles.helper}>
            Between 1 and {MAX_GOAL.toLocaleString()} steps. Default is{' '}
            {formatNumber(DEFAULT_GOAL)}.
          </Text>
        </Card>

        <Text style={styles.presetLabel}>Quick picks</Text>
        <View style={styles.presetRow}>
          {PRESETS.map((p) => {
            const active = Number(goalText) === p;
            return (
              <Pressable
                key={p}
                onPress={() => {
                  setGoalText(String(p));
                  setError('');
                }}
                style={[styles.preset, active && styles.presetActive]}
              >
                <Text
                  style={[styles.presetText, active && styles.presetTextActive]}
                >
                  {formatNumber(p)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <PrimaryButton label="Save Goal" onPress={onSave} style={styles.save} />
        <GhostButton
          label={`Reset to default (${formatNumber(DEFAULT_GOAL)})`}
          onPress={onReset}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: {
    fontSize: font.heading,
    fontWeight: '800',
    color: colors.text,
  },
  subheading: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  card: { marginBottom: spacing.lg },
  label: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.big,
    fontWeight: '800',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.divider,
    textAlign: 'center',
  },
  helper: {
    fontSize: font.tiny,
    color: colors.textSoft,
    marginTop: spacing.sm,
  },
  presetLabel: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preset: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetActive: {
    backgroundColor: colors.green,
  },
  presetText: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: '700',
  },
  presetTextActive: {
    color: colors.white,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: font.small,
    fontWeight: '600',
  },
  save: { marginTop: spacing.md },
});
