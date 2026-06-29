// Settings — compact mode, goal shortcut, replay onboarding, data controls,
// app info, manual tracking disclaimer, and privacy note.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAppData } from '../store';
import { Card, Divider } from '../components/UI';
import { colors, spacing, font, radius } from '../theme';
import { safeGoal, formatNumber } from '../logic';

export default function SettingsScreen({ navigation }) {
  const {
    settings,
    entries,
    setSettings,
    showOnboardingAgain,
    clearEntries,
    resetAll,
  } = useAppData();

  const goal = safeGoal(settings);
  const compact = !!settings?.compactMode;
  const version =
    Constants?.expoConfig?.version ||
    Constants?.manifest?.version ||
    '1.0.0';

  const toggleCompact = (value) => {
    setSettings({ compactMode: !!value });
  };

  const onShowOnboarding = async () => {
    await showOnboardingAgain();
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  const onDeleteEntries = () => {
    Alert.alert(
      'Delete all step entries',
      `This removes all ${entries.length} step ${
        entries.length === 1 ? 'entry' : 'entries'
      }. Your goal and settings are kept. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete entries',
          style: 'destructive',
          onPress: () => clearEntries(),
        },
      ]
    );
  };

  const onResetAll = () => {
    Alert.alert(
      'Reset all local data',
      'This erases all entries, your goal, and all settings, returning the app to its first-launch state. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset everything',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card tone="paper" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Compact mode</Text>
              <Text style={styles.rowSub}>
                Smaller progress ring and tighter spacing on the home screen.
              </Text>
            </View>
            <Switch
              value={compact}
              onValueChange={toggleCompact}
              trackColor={{ false: colors.track, true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
          <Divider />
          <NavRow
            title="Daily goal"
            value={`${formatNumber(goal)} steps`}
            onPress={() => navigation.navigate('Goal')}
          />
        </Card>

        {/* Data */}
        <Text style={styles.sectionTitle}>Your data</Text>
        <Card tone="paper" style={styles.card}>
          <NavRow
            title="Show onboarding again"
            value="Replay intro"
            onPress={onShowOnboarding}
          />
          <Divider />
          <ActionRow
            title="Delete all step entries"
            sub={`${entries.length} ${
              entries.length === 1 ? 'entry' : 'entries'
            } stored`}
            danger
            onPress={onDeleteEntries}
          />
          <Divider />
          <ActionRow
            title="Reset all local data"
            sub="Back to first-launch state"
            danger
            onPress={onResetAll}
          />
        </Card>

        {/* Manual tracking disclaimer */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card tone="green" style={styles.card}>
          <Text style={styles.disclaimerTitle}>Manual step journal</Text>
          <Text style={styles.disclaimerBody}>
            StepCount Journal is a manual step journal. It does not count steps
            automatically and does not connect to Google Fit, Health Connect,
            sensors, or wearable devices.
          </Text>
        </Card>

        {/* Privacy */}
        <Card style={styles.card}>
          <Text style={styles.infoTitle}>Privacy</Text>
          <Text style={styles.infoBody}>
            StepCount Journal stores step entries, goals, notes, and progress
            only on this device. No account, no ads, no analytics, no internet
            connection, no sensors, no Google Fit, and no Health Connect.
          </Text>
        </Card>

        {/* App info */}
        <Card style={styles.card}>
          <Text style={styles.infoTitle}>App information</Text>
          <InfoLine label="App" value="StepCount Journal" />
          <InfoLine label="Subtitle" value="Manual step tracker" />
          <InfoLine label="Version" value={String(version)} />
          <InfoLine label="Works offline" value="Yes (airplane mode safe)" />
          <InfoLine label="Permissions" value="None requested" />
        </Card>

        <Text style={styles.footer}>
          Made for calm, honest, manual step journaling.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavRow({ title, value, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.rowTitle}>{title}</Text>
      <View style={styles.navRight}>
        <Text style={styles.rowValue}>{value}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

function ActionRow({ title, sub, onPress, danger }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && { color: colors.danger }]}>
          {title}
        </Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Text style={[styles.chevron, danger && { color: colors.danger }]}>›</Text>
    </Pressable>
  );
}

function InfoLine({ label, value }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontSize: font.small,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rowTitle: {
    fontSize: font.body,
    fontWeight: '600',
    color: colors.text,
  },
  rowSub: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: font.small,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  chevron: {
    fontSize: font.heading,
    color: colors.textSoft,
  },
  disclaimerTitle: {
    fontSize: font.subheading,
    fontWeight: '700',
    color: colors.greenDark,
    marginBottom: spacing.xs,
  },
  disclaimerBody: {
    fontSize: font.small,
    color: colors.text,
    lineHeight: 20,
  },
  infoTitle: {
    fontSize: font.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoBody: {
    fontSize: font.small,
    color: colors.textMuted,
    lineHeight: 20,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: font.small,
    color: colors.text,
    fontWeight: '600',
  },
  footer: {
    fontSize: font.tiny,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
