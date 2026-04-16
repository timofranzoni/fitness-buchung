-- ============================================================
-- FitBook Migration 005 – Email-System
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. cancel_token & reminder_sent zu bookings hinzufügen
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancel_token  UUID        DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN     DEFAULT false;

-- Existing rows: fill cancel_token where NULL
UPDATE public.bookings SET cancel_token = gen_random_uuid() WHERE cancel_token IS NULL;

-- Unique index on cancel_token
CREATE UNIQUE INDEX IF NOT EXISTS bookings_cancel_token_uidx ON public.bookings (cancel_token);

-- 2. Benachrichtigungs-E-Mail zu studios hinzufügen
ALTER TABLE public.studios
  ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- Bestehende Studios: owner_email als notification_email übernehmen
UPDATE public.studios SET notification_email = owner_email WHERE notification_email IS NULL AND owner_email IS NOT NULL AND owner_email != '';

-- ============================================================
-- 3. pg_cron Erinnerungsmail (24h vorher)
--
-- Voraussetzungen:
--   a) pg_cron Extension aktivieren:
--      Supabase Dashboard → Database → Extensions → pg_cron → Enable
--   b) pg_net Extension aktivieren:
--      Supabase Dashboard → Database → Extensions → pg_net → Enable
--   c) SUPABASE_URL und SERVICE_ROLE_KEY als DB-Settings setzen:
--      ALTER DATABASE postgres SET app.supabase_url = 'https://DEIN-PROJECT.supabase.co';
--      ALTER DATABASE postgres SET app.service_role_key = 'DEIN_SERVICE_ROLE_KEY';
--
-- Dann dieses Statement ausführen:
-- ============================================================

/*
SELECT cron.schedule(
  'send-reminder-emails',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/send-reminder-emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);
*/

-- ============================================================
-- HINWEIS: Nach der Migration in der App
-- Supabase Dashboard → Edge Functions → Secrets setzen:
--   RESEND_API_KEY   = re_DEIN_KEY
--   FROM_EMAIL       = FitBook <buchung@deine-domain.de>
-- ============================================================
