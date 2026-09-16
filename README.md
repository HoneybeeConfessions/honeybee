# Honeybee

Anonymous numbered confessions for men — hugs, support comments, comebacks, optional private help paths. Sister of [The Voices](https://thevoisees.github.io/the-voices/).

Org: [HoneybeeConfessions](https://github.com/HoneybeeConfessions)  
Live web: [honeybeeconfessions.github.io/honeybee](https://honeybeeconfessions.github.io/honeybee/)

## Run locally (web)

```bash
npm install
npm run dev
```

Opens on port **5174** by default.

Optional: copy `.env.example` to `.env` and add Supabase credentials. Without them, everything stores in `localStorage`.

Run the SQL in `supabase/migrations/` (or `SETUP.sql`) on a **dedicated** Supabase project before enabling cloud sync.

## Build (GitHub Pages)

```bash
npm run build
```

Uses base path `/honeybee/`.

## Android app (Capacitor)

App id: `org.honeybeeconfessions.app`

```bash
# Needs Android SDK. Example:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

npm run cap:sync          # build:app (base /) + sync into android/
npm run cap:run           # sync + run on emulator/device
npm run cap:open          # open Android Studio
```

Debug APK after a sync/build:

`android/app/build/outputs/apk/debug/app-debug.apk`

Icon/splash: white background + Honeybee mark (`assets/`).
