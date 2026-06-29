# Supabase Setup

KX uses Supabase as the public demo persistence layer:

- Supabase Postgres stores resources, requests, purchase receipts, ratings, risk events, participants, file metadata and Arc Network snapshots.
- Supabase Storage stores private downloadable resource files.
- The application still verifies payments and streams downloads through KX API routes.

## Migrations

Run the SQL files in `supabase/migrations/` against the Supabase project:

1. `0001_initial_schema.sql`
2. `0002_private_resource_storage.sql`

The second migration creates a private Storage bucket named `kx-resource-files`.

## Required Environment Variables

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=kx-resource-files
RESOURCE_STORAGE_PROVIDER=supabase
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not expose it in browser code, logs, screenshots, GitHub or `NEXT_PUBLIC_*` variables.

## Public Demo Behavior

On first server access, the app also calls its schema guard and seeds curated resources and requests with `ON CONFLICT DO NOTHING`.

Runtime uploaded files are written to the private Supabase Storage bucket. Downloads are only served by the KX API after payment verification.
