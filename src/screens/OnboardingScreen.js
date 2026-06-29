// First-launch welcome. Explains manual journaling, no sensors, local-only.

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../store';
import { PrimaryButton, GhostButton, PathDots, Card } from '../components/UI';
import { colors, spacing, font, radius } from '../theme';

export default function OnboardingScreen({ navigation }) {
  const { completeOnboarding } = useAppData();

  const finish = async () => {
    await completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emblem}>
          <PathDots count={5} size={11} />
        </View>

        <Text style={styles.title}>StepCount Journal</Text>
        <Text style={styles.subtitle}>Manual step tracker</Text>

        <Text style={styles.lead}>Track your steps manually.</Text>
        <Text style={styles.body}>
          Enter daily steps, view weekly progress, and keep short notes — all
          in a calm personal logbook.
        </Text>

        <Card tone="green" style={styles.noteCard}>
          <Text style={styles.noteTitle}>No sensors. No accounts.</Text>
          <Text style={styles.noteBody}>
            StepCount Journal is a manual step journal. It does not count steps
            automatically and does not connect to Google Fit, Health Connect,
            sensors, or wearable devices.
          </Text>
          <Text style={styles.noteBody}>
            Everything is stored only on this device and works fully offline,
            even in airplane mode.
          </Text>
        </Card>

        <View style={styles.bullets}>
          <Bullet text="Enter steps for any day, by hand." />
          <Bullet text="Set a daily goal and watch your progress." />
          <Bullet text="See weekly stats and a simple streak." />
          <Bullet text="No internet, no ads, no tracking." />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Start Journal" onPress={finish} />
        <GhostButton label="Skip" onPress={finish} style={{ marginTop: spacing.sm }} />
      </View>
    </SafeAreaView>
  );
}

function Bullet({ text }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  emblem: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: font.big,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: font.subheading,
    color: colors.greenDark,
    marginTop: 2,
    marginBottom: spacing.xl,
    fontWeight: '600',
  },
  lead: {
    fontSize: font.heading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: font.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  noteCard: {
    marginBottom: spacing.lg,
  },
  noteTitle: {
    fontSize: font.subheading,
    fontWeight: '700',
    color: colors.greenDark,
    marginBottom: spacing.xs,
  },
  noteBody: {
    fontSize: font.small,
    color: colors.text,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  bullets: { marginTop: spacing.xs },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: colors.sky,
    marginTop: 7,
    marginRight: spacing.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
});
