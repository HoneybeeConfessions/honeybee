# Honeybee

Anonymous numbered confessions for men — hugs, support comments, comebacks, optional private help paths. Sister of [The Voices](https://thevoisees.github.io/the-voices/).

Org: [HoneybeeConfessions](https://github.com/HoneybeeConfessions)

## Run locally

```bash
npm install
npm run dev
```

Opens on port **5174** by default.

Optional: copy `.env.example` to `.env` and add Supabase credentials. Without them, everything stores in `localStorage`.

Run the SQL in `supabase/migrations/` on a **dedicated** Supabase project (not The Voices tables) before enabling cloud sync.

## Build

```bash
npm run build
```
