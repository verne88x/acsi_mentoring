# ACSI Platform v2 (New Repo)

This repo is a clean v2 scaffold with:
- Supabase auth (email/password)
- Roles (profiles.role): mentor | school_admin | acsi_admin | viewer
- Admin:
  - Create schools
  - Invite users (email invite -> user sets password)
  - Optional: assign invited user to a school
- Exports: Schools CSV
- Global Home button everywhere (AppShell)

## Setup
1) Create a **new GitHub repo** (e.g. `acsi-platform-v2`), upload this code.
2) Supabase: run `supabase/schema.sql` in SQL Editor.
3) Create `.env.local` from `.env.example`.
4) `npm install`
5) `npm run dev`

## Deploy (Vercel)
- Import the new repo
- Add env vars (same as `.env.example`)
- Deploy

## First admin
After you create your first user in Supabase Auth, run:

```sql
update public.profiles set role='acsi_admin' where email='YOUR_EMAIL';
```

Then sign in and open `/admin/users` to invite others.
