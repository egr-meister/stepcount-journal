# StepCount Journal

**Manual step tracker** — a calm, offline, manual step tracking journal built with React Native and Expo (Android-focused).

StepCount Journal is a personal logbook for steps. You enter your daily step counts by hand, set a daily goal, watch your progress, keep short notes, and review weekly statistics and a simple streak. Everything is stored locally on your device.

---

## Manual tracking disclaimer

> **StepCount Journal is a manual step journal. It does not count steps automatically and does not connect to Google Fit, Health Connect, sensors, or wearable devices.**

This disclaimer also appears in the app's onboarding screen and Settings screen. The app is honest and transparent: it is a manual journal, not an automatic pedometer. It makes no medical claims and provides no medical advice.

---

## Features

- **Daily step entry** — add or edit steps for today or any past date, with an optional note.
- **Daily step goal** — set your own goal (default 8,000 steps); edit it anytime.
- **Daily progress** — a soft circular step ring shows today's progress toward your goal.
- **Step history** — a journal-style log of every day, in reverse chronological order, with note previews and a goal indicator. Filter by week/month and search notes.
- **Weekly statistics** — weekly total, daily average, best day, and goal days, drawn as a seven-day walking path.
- **Streak** — a quiet, informational streak of consecutive goal days (current and best). No rewards, coins, or prizes.
- **Notes** — short memos for each day ("Walked after work", "Rest day", "Manual estimate").
- **Fully local** — all data lives on the device and survives app restarts.

---

## Offline-first explanation

StepCount Journal is offline-first by design. There is no backend, no cloud sync, and no account. The app reads and writes all of its data using on-device storage (AsyncStorage). It never makes a network request.

### Airplane mode support

Because nothing in the app needs the network, **StepCount Journal works fully in airplane mode**. You can open it, add entries, set goals, view stats, and reset data with the network completely off.

### No internet / no permissions note

The app does **not** request any runtime permissions and the Android manifest does **not** include the `INTERNET` permission. There are no permission prompts of any kind: no internet, location, camera, microphone, contacts, storage/gallery, notifications, calendar, alarms, activity recognition, body sensors, physical activity, Google Fit, or Health Connect.

### No sensors note

The app uses **no sensors**: no accelerometer, no pedometer API, no motion sensors, no activity recognition, and no background tracking.

### No Google Fit note

The app does **not** integrate with **Google Fit** and contains no Google Fit SDK.

### No Health Connect note

The app does **not** integrate with **Health Connect** and contains no Health Connect SDK.

### No automatic pedometer claim

StepCount Journal never claims to count steps automatically. Every number in the app was typed in by you. The UI consistently communicates **"Manual entry — no automatic step counting."**

---

## How the app works

### Local storage explanation

All data is persisted with [`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/) under a single key. On load, stored JSON is parsed defensively and merged with safe defaults. Corrupted JSON, missing fields, empty arrays, invalid dates, and invalid numbers all fall back to sane values instead of crashing. Data survives app restarts.

Stored data:

```js
StepEntry = {
  id: string,
  date: string,        // "YYYY-MM-DD"
  steps: number,
  note: string,
  createdAt: string,   // ISO timestamp
  updatedAt: string    // ISO timestamp
}

Settings = {
  onboardingCompleted: boolean,
  dailyGoal: number,
  compactMode: boolean,
  weekStartsOn: "monday"
}
```

### Daily step entry explanation

On the Add/Edit screen you choose a date (`YYYY-MM-DD`), enter steps, and optionally add a note. If a date already has an entry, saving **updates** that entry instead of creating a duplicate. Steps must be a whole number between 0 and 200,000; invalid input shows friendly validation text and never crashes the app.

### Daily goal explanation

Set a daily goal on the Goal screen (or via the Settings shortcut). The default is 8,000 steps. If the stored goal is missing or 0, the app uses the 8,000 default. Goals are validated to be greater than 0 and no more than 200,000.

### Progress explanation

`progress = steps / dailyGoal`. The visual ring is capped at 100%, but the real step count is always shown. Example states: "No steps entered yet", "52% of today's goal", "Goal reached".

### History explanation

History is a paper-style walking log: dates as journal labels, steps as clean numbers, and notes as small memo previews, newest first. It includes a local, case-insensitive note search and simple "This week / This month / All" filters. History is fully local.

### Weekly statistics explanation

The week starts on **Monday**. From your local entries the app computes the weekly total, daily average (total ÷ 7), best day, and number of goal days (0–7). Days without an entry count as 0 steps. The seven-day path is drawn with simple React Native views — no chart library.

### Streak explanation

A streak is the number of consecutive days where steps ≥ your daily goal. The current streak counts back from today; if today has no qualifying entry yet, the streak is measured through yesterday so an un-logged today does not incorrectly increase or break it. The best streak is the longest such run in your history. The streak is informational only — no gamification, rewards, or prize language.

### Notes explanation

Each entry can include a short note (up to 280 characters). Notes are stored locally and are fully optional; the app never crashes when a note is empty.

---

## Design

### App icon concept

A custom icon (no default Expo icon): a rounded square with a muted-green background, a pale journal page in the center with soft journal lines, and a small walking path made of step dots near the bottom — a clean, readable "manual tracker" mark.

### Splash screen concept

A custom splash (no default Expo splash): a warm off-white background, the centered journal-and-path emblem, the app name **StepCount Journal**, and the subtitle **Manual step tracker** — a calm, personal-journal feeling with no heavy imagery.

### Visual style concept

**"StepCount Calm Path Journal"** — calm, clean, honest, practical, health-journal (non-medical) personal logbook. Palette: warm off-white background, deep slate text, muted green progress, soft sky-blue accents, pale sand cards, light-gray dividers, and gentle clay note labels. Decorative elements are simple: step-path dots, a walking line, journal-paper cards, a soft progress ring, small note labels, and seven-day path stones.

### Daily step path layout uniqueness

The app intentionally avoids the generic "mascot → title → subtitle → stats card → vertical stack of buttons → settings" template. Instead:

- A compact header with the app title and a settings icon.
- A manual-entry-first today card built around the step ring, with the entry button integrated into the card.
- A weekly preview shown as seven small path stones/bars.
- A streak shown as a quiet walking-note label, not a reward badge.
- Recent entries shown as journal rows.
- A history screen styled like a paper walking log, and a statistics screen styled like a weekly walking path.

---

## Getting started

### Requirements

- Node.js 20+
- npm
- For native builds: JDK 17 and the Android SDK (Platform 35, Build Tools 35.0.0)

### How to scaffold with the Expo template

This repository was created from the default Expo template. To reproduce the scaffold from scratch:

```bash
npx create-expo-app stepcount-journal
cd stepcount-journal
```

### How to install dependencies through `npx expo install`

Always install packages with `npx expo install` so versions match your Expo SDK. Do not hand-write dependency versions.

```bash
# Core Expo modules (explicit direct dependencies)
npx expo install expo-asset expo-constants expo-font expo-modules-core expo-status-bar

# Local storage
npx expo install @react-native-async-storage/async-storage

# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Circular progress ring
npx expo install react-native-svg

# Android build configuration
npx expo install expo-build-properties
```

Every imported package is a direct dependency in `package.json`; the app does not rely on transitive dependencies.

Commit a complete `package-lock.json` from a full `npm install`. In CI, after `npm install`, run `npx expo install --fix`, then `npx expo-doctor` and `npx expo install --check`.

### How to run locally

```bash
npm install
npx expo install --fix      # align versions with the Expo SDK
npx expo-doctor             # health check
npx expo install --check    # verify dependency versions

npm run android             # or: npx expo start --android
```

---

## How to build Android

You can build with a local prebuild + Gradle, or use the included GitHub Actions workflow.

```bash
# Generate the native android/ project
npx expo prebuild --platform android --no-install

# Copy ProGuard rules (optional, for minified builds)
cp android-config/proguard-rules.pro android/app/proguard-rules.pro

# Build a release APK and AAB
cd android
./gradlew assembleRelease   # -> app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease     # -> app/build/outputs/bundle/release/app-release.aab
```

### How to generate a PKCS12 keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore stepcount-journal-release-key.p12 -alias stepcount_journal_key -keyalg RSA -keysize 2048 -validity 10000
```

Use the **same password** for the keystore and the key. Keep the `.p12` file and its passwords **out of the repository** (they are already in `.gitignore`).

### How to add GitHub Secrets

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 of your `.p12` file: `base64 -w0 stepcount-journal-release-key.p12` (macOS: `base64 -i ...`) |
| `ANDROID_KEYSTORE_PASSWORD` | The keystore password |
| `ANDROID_KEY_ALIAS` | `stepcount_journal_key` |
| `ANDROID_KEY_PASSWORD` | The key password (same as the keystore password) |

### GitHub Actions explanation

`.github/workflows/android-build.yml` runs on every push to `main` (and manual dispatch). It:

1. Checks out the repo and sets up Node.js 20 and JDK 17.
2. Installs the Android SDK, then `sdkmanager "platforms;android-35" "build-tools;35.0.0"`.
3. Runs `npm install`, then `npx expo install --fix`, `npx expo-doctor`, and `npx expo install --check`.
4. Runs `npx expo prebuild` to generate the native project.
5. Decodes the keystore from `ANDROID_KEYSTORE_BASE64` and injects a PKCS12 release signing config.
6. Builds a **signed release APK** (`assembleRelease`) and **signed release AAB** (`bundleRelease`).
7. Uploads the APK and AAB as workflow artifacts.

CI is responsible for a fast, stable signed build only. It does **not** launch an emulator smoke-test (kept off the free runners on purpose).

---

## Android / Google Play compatibility

### Android API 35 notes

- `compileSdkVersion` **35**
- `targetSdkVersion` **35** (not 34 — required to avoid Google Play target-API errors)
- `minSdkVersion` **24** (compatible with React Native 0.79)

These are set via the `expo-build-properties` config plugin in `app.json`.

### 16 KB page size compatibility note

The project targets a current Expo SDK / React Native version that supports Android 15+ **16 KB memory page sizes**, so the final AAB is compatible with devices using 16 KB pages. No old native libraries, sensor SDKs, Firebase, ads, analytics, or payment SDKs are included, keeping native surface area minimal and page-size-safe.

### Google Play compatibility notes

- Targets API 35 (satisfies Play's target-API requirement).
- 16 KB page-size compatible AAB.
- No `INTERNET` permission and no runtime permissions, so there are no sensitive-permission declarations to justify.
- No Google Fit, Health Connect, sensors, background tracking, location, ads, analytics, or payments.

### Release optimization notes

Use the standard Android **R8 / ProGuard** pipeline only — no risky third-party obfuscation. Verify a non-minified release first:

```gradle
minifyEnabled false
shrinkResources false
```

Then enable optimization and re-test the launch:

```gradle
minifyEnabled true
shrinkResources true
proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
```

The app is designed to run correctly in release mode with **Hermes** and minification enabled.

---

## Local launch verification checklist

A green CI build is not proof that the app launches. Before release, install and run a release build on a real device or emulator and capture logs:

```bash
adb install app-release.apk
adb logcat
```

Confirm there are **no** errors such as: "Cannot find native module", "Module has not been registered", "Invariant Violation", `theme.fonts.regular is undefined`, AsyncStorage JSON parse crash, missing route-params crash, invalid date crash, or invalid number crash.

Test the full flow:

- [ ] First launch with empty storage (onboarding shows)
- [ ] Add today's steps
- [ ] Edit today's steps
- [ ] Add a previous-day entry
- [ ] Add a note
- [ ] Delete an entry
- [ ] Set the daily goal
- [ ] Check daily progress
- [ ] Check weekly statistics
- [ ] Check the streak
- [ ] Reset all local data
- [ ] Relaunch the app (data persists / resets as expected)
- [ ] Launch in airplane mode
- [ ] Confirm no sensor, activity, Google Fit, Health Connect, or internet permission is requested

---

## Privacy note

StepCount Journal stores step entries, goals, notes, and progress **only on this device**. No account, no ads, no analytics, no internet connection, no sensors, no Google Fit, and no Health Connect.

---

## Project structure

```
stepcount-journal/
├── App.js                      # Navigation + providers
├── index.js                    # Entry point
├── app.json                    # Expo config (Android API 35, no INTERNET)
├── babel.config.js
├── package.json
├── assets/                     # Custom icon, adaptive icon, splash, favicon
├── android-config/
│   └── proguard-rules.pro      # Copy into android/app after prebuild
├── .github/workflows/
│   └── android-build.yml       # Signed APK + AAB CI
└── src/
    ├── theme.js                # Calm path-journal design tokens
    ├── storage.js              # AsyncStorage load/save + defensive defaults
    ├── logic.js                # Dates, progress, weekly stats, streak
    ├── store.js                # App-wide data context
    ├── components/
    │   ├── StepRing.js         # Circular progress ring (react-native-svg)
    │   ├── WeekPath.js         # Seven-day path (plain Views)
    │   └── UI.js               # Cards, buttons, pills, dots
    └── screens/
        ├── OnboardingScreen.js
        ├── HomeScreen.js
        ├── EntryScreen.js
        ├── HistoryScreen.js
        ├── StatsScreen.js
        ├── GoalScreen.js
        └── SettingsScreen.js
```

---

This app is a practical, offline, health-style journal utility. It is not a medical app, not a fitness sensor tracker, not a pedometer, not a children's app, and not a game.
