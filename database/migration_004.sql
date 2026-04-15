-- ============================================================
-- FitBook Migration 004 – studio_settings Multi-Tenant Fix
-- Ersetzt den Singleton (id=1) durch eine UUID-Tabelle mit studio_id als Key
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Alte Tabelle umbenennen
ALTER TABLE public.studio_settings RENAME TO studio_settings_old;

-- 2. Neue Tabelle ohne Singleton-Constraint
CREATE TABLE public.studio_settings (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id     UUID        UNIQUE NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  name          TEXT        DEFAULT 'FitBook',
  logo_emoji    TEXT        DEFAULT '⚡',
  logo_url      TEXT,
  primary_color TEXT        DEFAULT '#ff6b1a',
  description   TEXT        DEFAULT 'Dein Fitnessstudio. Deine Kurse. Deine Zeit.',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Daten migrieren
INSERT INTO public.studio_settings (studio_id, name, logo_emoji, logo_url, primary_color, description, updated_at)
SELECT studio_id, name, logo_emoji, logo_url, primary_color, description, updated_at
FROM public.studio_settings_old
WHERE studio_id IS NOT NULL;

-- 4. Alte Tabelle löschen
DROP TABLE public.studio_settings_old;

-- 5. RLS aktivieren
ALTER TABLE public.studio_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read settings"         ON public.studio_settings;
DROP POLICY IF EXISTS "Studio admin can update settings" ON public.studio_settings;
DROP POLICY IF EXISTS "Studio admin can insert settings" ON public.studio_settings;

CREATE POLICY "Public can read settings"
  ON public.studio_settings FOR SELECT USING (true);

CREATE POLICY "Studio admin can update settings"
  ON public.studio_settings FOR UPDATE USING (
    studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
  );

CREATE POLICY "Studio admin can insert settings"
  ON public.studio_settings FOR INSERT WITH CHECK (
    studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
  );

-- ============================================================
-- NACH DER MIGRATION: Für jedes neue Studio Einstellungen anlegen:
-- INSERT INTO public.studio_settings (studio_id) VALUES ('<studio-uuid>');
-- ============================================================
