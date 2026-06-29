// Local-only persistence using AsyncStorage.
// Defensive: merges with defaults, tolerates empty/missing/corrupted data,
// and never throws to the UI layer.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@stepcount_journal_v1';

export const DEFAULT_GOAL = 8000;
export const MAX_STEPS = 200000;
export const MAX_GOAL = 200000;

export const defaultSettings = {
  onboardingCompleted: false,
  dailyGoal: DEFAULT_GOAL,
  compactMode: false,
  weekStartsOn: 'monday',
};

export const defaultAppData = {
  entries: [],
  settings: { ...defaultSettings },
};

// Make sure whatever we read becomes a clean, predictable object.
export function normalizeAppData(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const rawSettings =
    data.settings && typeof data.settings === 'object' ? data.settings : {};

  let goal = Number(rawSettings.dailyGoal);
  if (!Number.isFinite(goal) || goal <= 0) {
    goal = DEFAULT_GOAL;
  }
  goal = Math.min(Math.round(goal), MAX_GOAL);

  const settings = {
    onboardingCompleted: Boolean(rawSettings.onboardingCompleted),
    dailyGoal: goal,
    compactMode: Boolean(rawSettings.compactMode),
    weekStartsOn: 'monday',
  };

  const rawEntries = Array.isArray(data.entries) ? data.entries : [];
  const entries = rawEntries
    .filter((e) => e && typeof e === 'object')
    .map(normalizeEntry)
    .filter((e) => e !== null);

  return { entries, settings };
}

export function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const date = typeof entry.date === 'string' ? entry.date.trim() : '';
  if (!date) return null;

  let steps = Number(entry.steps);
  if (!Number.isFinite(steps) || steps < 0) steps = 0;
  steps = Math.min(Math.round(steps), MAX_STEPS);

  const note = typeof entry.note === 'string' ? entry.note : '';
  const id =
    typeof entry.id === 'string' && entry.id ? entry.id : makeId();
  const createdAt =
    typeof entry.createdAt === 'string' && entry.createdAt
      ? entry.createdAt
      : new Date().toISOString();
  const updatedAt =
    typeof entry.updatedAt === 'string' && entry.updatedAt
      ? entry.updatedAt
      : createdAt;

  return { id, date, steps, note, createdAt, updatedAt };
}

export function makeId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

// Read everything. Always resolves with a valid object (never rejects).
export async function loadAppData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultAppData, settings: { ...defaultSettings } };
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      // Corrupted JSON — fall back to defaults instead of crashing.
      return { ...defaultAppData, settings: { ...defaultSettings } };
    }
    return normalizeAppData(parsed);
  } catch (err) {
    return { ...defaultAppData, settings: { ...defaultSettings } };
  }
}

// Persist the whole app data object. Returns true on success.
export async function saveAppData(appData) {
  try {
    const normalized = normalizeAppData(appData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch (err) {
    return false;
  }
}

// Insert or update an entry for a given date (no duplicates per date).
export function upsertEntry(appData, { date, steps, note }) {
  const data = normalizeAppData(appData);
  const cleanDate = typeof date === 'string' ? date.trim() : '';
  const now = new Date().toISOString();

  let cleanSteps = Number(steps);
  if (!Number.isFinite(cleanSteps) || cleanSteps < 0) cleanSteps = 0;
  cleanSteps = Math.min(Math.round(cleanSteps), MAX_STEPS);

  const cleanNote = typeof note === 'string' ? note : '';

  const idx = data.entries.findIndex((e) => e.date === cleanDate);
  if (idx >= 0) {
    const existing = data.entries[idx];
    data.entries[idx] = {
      ...existing,
      steps: cleanSteps,
      note: cleanNote,
      updatedAt: now,
    };
  } else {
    data.entries.push({
      id: makeId(),
      date: cleanDate,
      steps: cleanSteps,
      note: cleanNote,
      createdAt: now,
      updatedAt: now,
    });
  }
  return data;
}

// Remove an entry by id.
export function deleteEntry(appData, id) {
  const data = normalizeAppData(appData);
  data.entries = data.entries.filter((e) => e.id !== id);
  return data;
}

// Update settings, keeping the rest of the data intact.
export function updateSettings(appData, partial) {
  const data = normalizeAppData(appData);
  data.settings = { ...data.settings, ...(partial || {}) };
  return normalizeAppData(data);
}

// Wipe only entries, keep settings.
export async function clearEntries(appData) {
  const data = normalizeAppData(appData);
  data.entries = [];
  await saveAppData(data);
  return data;
}

// Reset absolutely everything to defaults.
export async function resetAllData() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignore
  }
  return { ...defaultAppData, settings: { ...defaultSettings } };
}

export { STORAGE_KEY };
