-- ============================================================
-- FitBook Datenbankschema
-- Ausführen in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Kurse-Tabelle
CREATE TABLE IF NOT EXISTS public.courses (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  icon        TEXT        NOT NULL DEFAULT '🏋️',
  description TEXT,
  intensity   TEXT        CHECK (intensity IN ('Leicht', 'Mittel', 'Intensiv')) DEFAULT 'Mittel',
  duration    INTEGER     NOT NULL DEFAULT 60,
  color       TEXT        DEFAULT '#ff6b1a',
  slots       TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Buchungs-Tabelle
CREATE TABLE IF NOT EXISTS public.bookings (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id     TEXT        UNIQUE NOT NULL,
  customer_name  TEXT        NOT NULL,
  customer_email TEXT        NOT NULL,
  course_id      UUID        REFERENCES public.courses(id) ON DELETE SET NULL,
  course_name    TEXT        NOT NULL,
  course_icon    TEXT,
  slot_time      TEXT        NOT NULL,
  booking_date   DATE        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security aktivieren
ALTER TABLE public.courses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Kurse: öffentlich lesbar
CREATE POLICY "Public can read courses"
  ON public.courses FOR SELECT USING (true);

-- Kurse: nur Admins dürfen schreiben
CREATE POLICY "Authenticated can insert courses"
  ON public.courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update courses"
  ON public.courses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete courses"
  ON public.courses FOR DELETE USING (auth.role() = 'authenticated');

-- Buchungen: jeder darf anlegen (Kunden-Buchung)
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (true);

-- Buchungen: nur Admins dürfen lesen und löschen
CREATE POLICY "Authenticated can read bookings"
  ON public.bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete bookings"
  ON public.bookings FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- Beispielkurse einspielen
-- ============================================================
INSERT INTO public.courses (name, icon, description, intensity, duration, color, slots) VALUES
  ('Yoga Flow',   '🧘', 'Entspannung & Flexibilität',            'Leicht',  60, '#a78bfa', ARRAY['08:00','10:00','12:00','17:00','19:00']),
  ('CrossFit',    '🏋️', 'Hochintensives Functional Training',    'Intensiv', 45, '#f87171', ARRAY['06:30','08:00','12:00','18:00','20:00']),
  ('Spinning',    '🚴', 'Indoor Cycling für Ausdauer',           'Mittel',   50, '#34d399', ARRAY['07:00','09:00','12:30','17:30','19:30']),
  ('Pilates',     '🤸', 'Körperkontrolle & Kraft',               'Leicht',  55, '#fbbf24', ARRAY['09:00','11:00','14:00','16:00','18:30']),
  ('Box-Fitness', '🥊', 'Kraft, Schnelligkeit & Ausdauer',       'Intensiv', 60, '#fb923c', ARRAY['07:30','10:00','12:00','17:00','19:00']),
  ('Zumba',       '💃', 'Tanzen & Fitness kombiniert',           'Mittel',   60, '#e879f9', ARRAY['10:00','12:00','16:00','18:00','20:00'])
ON CONFLICT DO NOTHING;
