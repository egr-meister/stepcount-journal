// Pure, defensive helpers for dates, progress, weekly stats and streaks.
// Everything tolerates missing / invalid input and never throws.

import { DEFAULT_GOAL } from './storage';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ---------- Date helpers (ISO-like YYYY-MM-DD strings) ----------

function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

// Format a JS Date into a local YYYY-MM-DD string.
export function toISODate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

export function todayISO() {
  return toISODate(new Date());
}

// Strictly validate a YYYY-MM-DD string and that it is a real calendar date.
export function isValidISODate(value) {
  if (typeof value !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, mo - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === mo - 1 &&
    dt.getDate() === d
  );
}

// Parse a valid ISO date string into a Date at local midnight, else null.
export function parseISO(value) {
  if (!isValidISODate(value)) return null;
  const [y, mo, d] = value.split('-').map(Number);
  return new Date(y, mo - 1, d);
}

// Day name for a date string, or '' if invalid.
export function dayName(value, short = false) {
  const dt = parseISO(value);
  if (!dt) return '';
  return short ? DAY_SHORT[dt.getDay()] : DAY_NAMES[dt.getDay()];
}

// Human-friendly label, e.g. "Mon, Jun 29". Falls back to the raw value.
export function prettyDate(value) {
  const dt = parseISO(value);
  if (!dt) return typeof value === 'string' ? value : '';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${DAY_SHORT[dt.getDay()]}, ${months[dt.getMonth()]} ${dt.getDate()}`;
}

// Relative label for today / yesterday, otherwise pretty date.
export function relativeDate(value) {
  if (value === todayISO()) return 'Today';
  const dt = parseISO(value);
  if (!dt) return prettyDate(value);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (value === toISODate(y)) return 'Yesterday';
  return prettyDate(value);
}

function addDays(date, n) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

// Monday as the start of the week (weekStartsOn is always "monday").
export function startOfWeek(date) {
  const base = date instanceof Date && !isNaN(date) ? date : new Date();
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const day = d.getDay(); // 0 = Sun ... 6 = Sat
  const diff = (day + 6) % 7; // days since Monday
  return addDays(d, -diff);
}

// Array of 7 ISO date strings for the week containing `date` (Mon..Sun).
export function weekDates(date) {
  const start = startOfWeek(date || new Date());
  const out = [];
  for (let i = 0; i < 7; i += 1) {
    out.push(toISODate(addDays(start, i)));
  }
  return out;
}

// ---------- Lookups ----------

export function getEntryForDate(entries, date) {
  const list = Array.isArray(entries) ? entries : [];
  return list.find((e) => e && e.date === date) || null;
}

export function safeSteps(entry) {
  const s = Number(entry?.steps ?? 0);
  if (!Number.isFinite(s) || s < 0) return 0;
  return Math.round(s);
}

export function safeGoal(settings) {
  const g = Number(settings?.dailyGoal ?? DEFAULT_GOAL);
  if (!Number.isFinite(g) || g <= 0) return DEFAULT_GOAL;
  return Math.round(g);
}

// ---------- Progress ----------

export function progressFor(steps, goal) {
  const s = Math.max(0, Number(steps) || 0);
  const g = Math.max(1, Number(goal) || DEFAULT_GOAL);
  return {
    ratio: Math.min(s / g, 1), // capped for visuals
    rawRatio: s / g,
    percent: Math.round((s / g) * 100),
    reached: s >= g,
  };
}

// ---------- Weekly statistics ----------

export function weeklyStats(entries, settings, refDate) {
  const goal = safeGoal(settings);
  const dates = weekDates(refDate || new Date());
  const list = Array.isArray(entries) ? entries : [];

  const days = dates.map((d) => {
    const entry = getEntryForDate(list, d);
    const steps = safeSteps(entry);
    return {
      date: d,
      steps,
      name: dayName(d),
      shortName: dayName(d, true),
      reached: steps >= goal && steps > 0,
      hasEntry: !!entry,
    };
  });

  const total = days.reduce((sum, d) => sum + d.steps, 0);
  const average = Math.round(total / 7);
  const goalDays = days.filter((d) => d.reached).length;

  let best = null;
  days.forEach((d) => {
    if (d.steps > 0 && (!best || d.steps > best.steps)) best = d;
  });

  const maxSteps = days.reduce((m, d) => Math.max(m, d.steps), 0);

  return {
    goal,
    days,
    total,
    average,
    goalDays,
    best, // may be null when no steps logged
    maxSteps,
    weekStart: dates[0],
    weekEnd: dates[6],
  };
}

// ---------- Streak ----------
// Current streak = consecutive days (ending today or yesterday) with
// steps >= goal. Best streak = longest such run across all history.

export function computeStreaks(entries, settings) {
  const goal = safeGoal(settings);
  const list = Array.isArray(entries) ? entries : [];

  // Maps of date -> reached goal? and date -> has any entry?
  const reached = {};
  const hasEntry = {};
  list.forEach((e) => {
    if (e && isValidISODate(e.date)) {
      hasEntry[e.date] = true;
      reached[e.date] = safeSteps(e) >= goal && safeSteps(e) > 0;
    }
  });

  // ----- Current streak -----
  // Count back from today. Two cases for "today":
  //  - today has an entry that missed the goal -> it is a real miss, streak = 0
  //  - today has no entry yet -> don't break the streak; count from yesterday
  let current = 0;
  const today = new Date();
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = toISODate(cursor);

  if (hasEntry[todayKey] && !reached[todayKey]) {
    // Logged today but below goal — streak resets.
    current = 0;
  } else {
    if (!reached[todayKey]) {
      cursor = addDays(cursor, -1); // no entry today; continue through yesterday
    }
    while (reached[toISODate(cursor)]) {
      current += 1;
      cursor = addDays(cursor, -1);
    }
  }

  // ----- Best streak (scan all reached dates) -----
  const reachedDates = Object.keys(reached)
    .filter((d) => reached[d])
    .sort();

  let best = 0;
  let run = 0;
  let prev = null;
  reachedDates.forEach((d) => {
    const dt = parseISO(d);
    if (!dt) return;
    if (prev) {
      const expected = addDays(prev, 1);
      if (toISODate(expected) === d) {
        run += 1;
      } else {
        run = 1;
      }
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = dt;
  });

  best = Math.max(best, current);

  return { current, best, goalReachedToday: !!reached[todayKey] };
}

// ---------- Sorting ----------

export function sortEntriesDesc(entries) {
  const list = Array.isArray(entries) ? entries.slice() : [];
  list.sort((a, b) => {
    const da = a?.date || '';
    const db = b?.date || '';
    if (da < db) return 1;
    if (da > db) return -1;
    return 0;
  });
  return list;
}

// Filter helpers for History (this week / this month / all).
export function filterEntries(entries, mode, refDate) {
  const list = Array.isArray(entries) ? entries : [];
  if (mode === 'week') {
    const set = new Set(weekDates(refDate || new Date()));
    return list.filter((e) => set.has(e?.date));
  }
  if (mode === 'month') {
    const d = refDate instanceof Date ? refDate : new Date();
    const prefix = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    return list.filter((e) => (e?.date || '').startsWith(prefix));
  }
  return list;
}

// Case-insensitive note search.
export function searchEntries(entries, query) {
  const list = Array.isArray(entries) ? entries : [];
  const q = (query || '').trim().toLowerCase();
  if (!q) return list;
  return list.filter((e) => (e?.note || '').toLowerCase().includes(q));
}

export function formatNumber(n) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export { DAY_NAMES, DAY_SHORT };
