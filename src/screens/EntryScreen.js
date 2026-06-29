// Add / edit a single day's manual step entry.
// Fields: date (YYYY-MM-DD), steps, note. Friendly validation, never crashes.

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../store';
import { PrimaryButton, GhostButton, Card } from '../components/UI';
import { colors, spacing, font, radius } from '../theme';
import { MAX_STEPS } from '../storage';
import {
  todayISO,
  isValidISODate,
  getEntryForDate,
  safeSteps,
  relativeDate,
} from '../logic';

export default function EntryScreen({ route, navigation }) {
  const { entries, saveEntry, removeEntry } = useAppData();

  const params = route?.params ?? {};
  const initialDate =
    typeof params.date === 'string' && params.date ? params.date : todayISO();
  const mode = params.mode === 'edit' ? 'edit' : 'add';

  const existing = useMemo(
    () => getEntryForDate(entries, initialDate),
    [entries, initialDate]
  );

  const [date, setDate] = useState(initialDate);
  const [stepsText, setStepsText] = useState(
    existing ? String(safeSteps(existing)) : ''
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState('');

  // Re-resolve entry for the currently typed date (for delete availability).
  const currentEntry = useMemo(
    () => getEntryForDate(entries, date),
    [entries, date]
  );
  const isEditing = !!currentEntry;

  const validate = () => {
    if (!isValidISODate(date)) {
      return 'Please enter a real date in YYYY-MM-DD format.';
    }
    const trimmed = (stepsText || '').trim();
    if (trimmed === '') {
      return 'Please enter the number of steps.';
    }
    if (!/^\d+$/.test(trimmed)) {
      return 'Steps must be a whole, non-negative number.';
    }
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value < 0) {
      return 'Steps must be zero or more.';
    }
    if (value > MAX_STEPS) {
      return `Steps must not exceed ${MAX_STEPS.toLocaleString()}.`;
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
    await saveEntry({
      date: date.trim(),
      steps: Number(stepsText.trim()),
      note: note,
    });
    navigation.goBack();
  };

  const onDelete = () => {
    if (!currentEntry) return;
    Alert.alert(
      'Delete entry',
      `Remove the step entry for ${relativeDate(currentEntry.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeEntry(currentEntry.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const setToday = () => {
    setDate(todayISO());
    setError('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>
            {mode === 'edit' || isEditing ? 'Edit step entry' : 'New step entry'}
          </Text>
          <Text style={styles.subheading}>
            Steps are entered manually. {relativeDate(date)}
          </Text>

          {/* Date */}
          <Card tone="paper" style={styles.fieldCard}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Date</Text>
              <Pressable onPress={setToday} hitSlop={8}>
                <Text style={styles.todayLink}>Use today</Text>
              </Pressable>
            </View>
            <TextInput
              value={date}
              onChangeText={(t) => {
                setDate(t);
                if (error) setError('');
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSoft}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              style={styles.input}
              maxLength={10}
            />
            <Text style={styles.helper}>Use YYYY-MM-DD format.</Text>
          </Card>

          {/* Steps */}
          <Card tone="paper" style={styles.fieldCard}>
            <Text style={styles.label}>Steps</Text>
            <TextInput
              value={stepsText}
              onChangeText={(t) => {
                // keep only digits, stay calm on bad input
                const cleaned = t.replace(/[^0-9]/g, '').slice(0, 6);
                setStepsText(cleaned);
                if (error) setError('');
              }}
              placeholder="e.g. 8000"
              placeholderTextColor={colors.textSoft}
              keyboardType="number-pad"
              style={[styles.input, styles.stepsInput]}
            />
            <Text style={styles.helper}>
              Whole number between 0 and {MAX_STEPS.toLocaleString()}.
            </Text>
          </Card>

          {/* Note */}
          <Card tone="paper" style={styles.fieldCard}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Walked after work, rainy day, rest day…"
              placeholderTextColor={colors.textSoft}
              style={[styles.input, styles.noteInput]}
              multiline
              maxLength={280}
            />
            <Text style={styles.helper}>{(note || '').length}/280</Text>
          </Card>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton label="Save Entry" onPress={onSave} style={styles.save} />

          {isEditing ? (
            <GhostButton
              label="Delete Entry"
              tone="danger"
              onPress={onDelete}
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heading: {
    fontSize: font.heading,
    fontWeight: '800',
    color: colors.text,
  },
  subheading: {
    fontSize: font.small,
    color: colors.greenDark,
    marginTop: 2,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  fieldCard: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  todayLink: {
    fontSize: font.small,
    color: colors.greenDark,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.subheading,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  stepsInput: {
    fontSize: font.heading,
    fontWeight: '700',
  },
  noteInput: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: font.tiny,
    color: colors.textSoft,
    marginTop: spacing.xs,
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
  save: {
    marginTop: spacing.sm,
  },
});
