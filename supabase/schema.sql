-- OKR Platform – Supabase schema
-- Run this once in your Supabase project: SQL Editor → New query → paste & run

-- ── App settings ──────────────────────────────────────────────────────────────
-- Stores all settings (branding, calendar, teams, OKRs) as a single JSONB row.
-- Key 'global' is the single-tenant default.

CREATE TABLE IF NOT EXISTS app_settings (
  key         text        PRIMARY KEY,
  data        jsonb       NOT NULL DEFAULT '{}',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Allow public read/write via anon key (single-tenant, no auth).
-- If you add authentication later, replace these policies with user-scoped ones.
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read"  ON app_settings FOR SELECT USING (true);
CREATE POLICY "public_write" ON app_settings FOR ALL    USING (true) WITH CHECK (true);

-- Seed a global settings row (empty — defaults are applied in the app)
INSERT INTO app_settings (key, data)
VALUES ('global', '{}')
ON CONFLICT (key) DO NOTHING;
