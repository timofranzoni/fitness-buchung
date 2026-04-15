-- ============================================================
-- FitBook Migration 003 – Multi-Tenant
-- Supabase Dashboard → SQL Editor → Run
-- Reihenfolge: Tabellen → Indizes → Funktionen → RLS → Policies → Daten
-- ============================================================

-- ── SCHRITT 1: TABELLEN ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.studios (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT        UNIQUE NOT NULL,
  name        TEXT        NOT NULL,
  owner_email TEXT,
  active      BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.studio_users (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  studio_id  UUID        REFERENCES public.studios(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SCHRITT 2: INDIZES ───────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS studio_users_user_studio_uidx
  ON public.studio_users (user_id, COALESCE(studio_id, '00000000-0000-0000-0000-000000000000'::UUID));

-- ── SCHRITT 3: FUNKTIONEN ────────────────────────────────────
-- (studio_users existiert jetzt bereits)

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.studio_users
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
$$;

CREATE OR REPLACE FUNCTION public.assign_studio_admin(p_email TEXT, p_studio_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kein Benutzer mit der E-Mail % gefunden. Zuerst in Supabase → Authentication → Users anlegen.', p_email;
  END IF;
  INSERT INTO public.studio_users (user_id, studio_id, role)
  VALUES (v_user_id, p_studio_id, 'admin')
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_superadmin(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kein Benutzer mit E-Mail % gefunden.', p_email;
  END IF;
  INSERT INTO public.studio_users (user_id, studio_id, role)
  VALUES (v_user_id, NULL, 'superadmin')
  ON CONFLICT DO NOTHING;
END;
$$;

-- ── SCHRITT 4: RLS AKTIVIEREN ────────────────────────────────

ALTER TABLE public.studios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_users ENABLE ROW LEVEL SECURITY;

-- ── SCHRITT 5: POLICIES ──────────────────────────────────────

-- studios
DROP POLICY IF EXISTS "Public can read active studios" ON public.studios;
DROP POLICY IF EXISTS "Superadmin can manage studios"  ON public.studios;
CREATE POLICY "Public can read active studios" ON public.studios FOR SELECT USING (active = true);
CREATE POLICY "Superadmin can manage studios"  ON public.studios FOR ALL    USING (is_superadmin());

-- studio_users
DROP POLICY IF EXISTS "Users can read own assignments"     ON public.studio_users;
DROP POLICY IF EXISTS "Superadmin can manage studio_users" ON public.studio_users;
CREATE POLICY "Users can read own assignments"     ON public.studio_users FOR SELECT USING (user_id = auth.uid() OR is_superadmin());
CREATE POLICY "Superadmin can manage studio_users" ON public.studio_users FOR ALL    USING (is_superadmin());

-- ── SCHRITT 6: studio_id SPALTEN ZU BESTEHENDEN TABELLEN ─────

ALTER TABLE public.courses         ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE public.bookings        ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE public.trainers        ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE public.studio_settings ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE;

-- courses
DROP POLICY IF EXISTS "Authenticated can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated can update courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated can delete courses" ON public.courses;
CREATE POLICY "Studio admin can insert courses" ON public.courses FOR INSERT WITH CHECK (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);
CREATE POLICY "Studio admin can update courses" ON public.courses FOR UPDATE USING (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);
CREATE POLICY "Studio admin can delete courses" ON public.courses FOR DELETE USING (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);

-- bookings
DROP POLICY IF EXISTS "Authenticated can read bookings"   ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can delete bookings" ON public.bookings;
CREATE POLICY "Studio admin can read bookings" ON public.bookings FOR SELECT USING (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);
CREATE POLICY "Studio admin can delete bookings" ON public.bookings FOR DELETE USING (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);

-- trainers
DROP POLICY IF EXISTS "Authenticated can insert trainers" ON public.trainers;
DROP POLICY IF EXISTS "Authenticated can update trainers" ON public.trainers;
DROP POLICY IF EXISTS "Authenticated can delete trainers" ON public.trainers;
CREATE POLICY "Studio admin can insert trainers" ON public.trainers FOR INSERT WITH CHECK (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);
CREATE POLICY "Studio admin can update trainers" ON public.trainers FOR UPDATE USING (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);
CREATE POLICY "Studio admin can delete trainers" ON public.trainers FOR DELETE USING (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);

-- studio_settings
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.studio_settings;
DROP POLICY IF EXISTS "Authenticated can insert settings" ON public.studio_settings;
CREATE POLICY "Studio admin can update settings" ON public.studio_settings FOR UPDATE USING (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);
CREATE POLICY "Studio admin can insert settings" ON public.studio_settings FOR INSERT WITH CHECK (
  studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid()) OR is_superadmin()
);

-- ── SCHRITT 7: DATEN MIGRIEREN ───────────────────────────────

INSERT INTO public.studios (id, slug, name, owner_email)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo', 'Demo Studio', '')
ON CONFLICT DO NOTHING;

INSERT INTO public.studio_settings (id, studio_id)
VALUES (1, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET studio_id = '00000000-0000-0000-0000-000000000001';

UPDATE public.courses  SET studio_id = '00000000-0000-0000-0000-000000000001' WHERE studio_id IS NULL;
UPDATE public.bookings SET studio_id = '00000000-0000-0000-0000-000000000001' WHERE studio_id IS NULL;
UPDATE public.trainers SET studio_id = '00000000-0000-0000-0000-000000000001' WHERE studio_id IS NULL;

-- ============================================================
-- NACH DER MIGRATION: Deinen Account als Superadmin eintragen:
-- SELECT assign_superadmin('deine@email.de');
-- ============================================================
