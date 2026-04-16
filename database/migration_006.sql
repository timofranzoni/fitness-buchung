-- ============================================================
-- FitBook Migration 006 – Studio Content (Live-Editor)
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.studio_content (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id  UUID        UNIQUE NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  content    JSONB       NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.studio_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read content"           ON public.studio_content;
DROP POLICY IF EXISTS "Studio admin can update content"   ON public.studio_content;
DROP POLICY IF EXISTS "Studio admin can insert content"   ON public.studio_content;

CREATE POLICY "Public can read content"
  ON public.studio_content FOR SELECT USING (true);

CREATE POLICY "Studio admin can update content"
  ON public.studio_content FOR UPDATE USING (
    studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid())
    OR is_superadmin()
  );

CREATE POLICY "Studio admin can insert content"
  ON public.studio_content FOR INSERT WITH CHECK (
    studio_id IN (SELECT studio_id FROM public.studio_users WHERE user_id = auth.uid())
    OR is_superadmin()
  );

-- Default-Inhalt für Demo-Studio
INSERT INTO public.studio_content (studio_id, content)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{}'::jsonb
)
ON CONFLICT (studio_id) DO NOTHING;
