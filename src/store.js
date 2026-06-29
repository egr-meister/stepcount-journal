// App-wide data store via React Context.
// Holds the single source of truth (entries + settings), persists every
// change to AsyncStorage, and exposes safe mutation helpers to screens.

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  loadAppData,
  saveAppData,
  upsertEntry,
  deleteEntry as deleteEntryPure,
  updateSettings as updateSettingsPure,
  clearEntries as clearEntriesAsync,
  resetAllData as resetAllAsync,
  defaultAppData,
  defaultSettings,
} from './storage';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [appData, setAppData] = useState({
    ...defaultAppData,
    settings: { ...defaultSettings },
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadAppData();
      if (mounted) {
        setAppData(data);
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist helper — updates state and writes to storage.
  const commit = useCallback(async (nextData) => {
    setAppData(nextData);
    await saveAppData(nextData);
    return nextData;
  }, []);

  const saveEntry = useCallback(
    async ({ date, steps, note }) => {
      const next = upsertEntry(appData, { date, steps, note });
      return commit(next);
    },
    [appData, commit]
  );

  const removeEntry = useCallback(
    async (id) => {
      const next = deleteEntryPure(appData, id);
      return commit(next);
    },
    [appData, commit]
  );

  const setSettings = useCallback(
    async (partial) => {
      const next = updateSettingsPure(appData, partial);
      return commit(next);
    },
    [appData, commit]
  );

  const setGoal = useCallback(
    async (goal) => {
      return setSettings({ dailyGoal: goal });
    },
    [setSettings]
  );

  const completeOnboarding = useCallback(async () => {
    return setSettings({ onboardingCompleted: true });
  }, [setSettings]);

  const showOnboardingAgain = useCallback(async () => {
    return setSettings({ onboardingCompleted: false });
  }, [setSettings]);

  const clearEntries = useCallback(async () => {
    const next = await clearEntriesAsync(appData);
    setAppData(next);
    return next;
  }, [appData]);

  const resetAll = useCallback(async () => {
    const next = await resetAllAsync();
    setAppData(next);
    return next;
  }, []);

  const value = useMemo(
    () => ({
      ready,
      appData,
      entries: appData?.entries ?? [],
      settings: appData?.settings ?? { ...defaultSettings },
      saveEntry,
      removeEntry,
      setSettings,
      setGoal,
      completeOnboarding,
      showOnboardingAgain,
      clearEntries,
      resetAll,
    }),
    [
      ready,
      appData,
      saveEntry,
      removeEntry,
      setSettings,
      setGoal,
      completeOnboarding,
      showOnboardingAgain,
      clearEntries,
      resetAll,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    // Defensive fallback so screens never crash if used outside provider.
    return {
      ready: true,
      appData: { ...defaultAppData, settings: { ...defaultSettings } },
      entries: [],
      settings: { ...defaultSettings },
      saveEntry: async () => {},
      removeEntry: async () => {},
      setSettings: async () => {},
      setGoal: async () => {},
      completeOnboarding: async () => {},
      showOnboardingAgain: async () => {},
      clearEntries: async () => {},
      resetAll: async () => {},
    };
  }
  return ctx;
}

export default AppDataContext;
