// StepCount Journal — a manual, offline step tracking journal.
// No sensors, no Google Fit, no Health Connect, no internet. All local.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppDataProvider, useAppData } from './src/store';
import { Loading } from './src/components/UI';
import { colors } from './src/theme';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import EntryScreen from './src/screens/EntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import GoalScreen from './src/screens/GoalScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Extend the built-in theme so theme.fonts (incl. fonts.regular) is always
// defined — never build a navigation theme from scratch.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    primary: colors.green,
    border: colors.divider,
    notification: colors.green,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700', color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
  headerBackTitle: '',
};

function RootNavigator() {
  const { ready, settings } = useAppData();

  if (!ready) {
    return <Loading />;
  }

  const onboarded = !!settings?.onboardingCompleted;

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={onboarded ? 'Home' : 'Onboarding'}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Entry"
        component={EntryScreen}
        options={{ title: 'Step Entry' }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Journal History' }}
      />
      <Stack.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: 'Weekly Path' }}
      />
      <Stack.Screen
        name="Goal"
        component={GoalScreen}
        options={{ title: 'Daily Goal' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
