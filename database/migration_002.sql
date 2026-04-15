-- ============================================================
-- FitBook Migration 002 – Studio-Einstellungen & Trainer
-- Sicher mehrfach ausführbar (DROP IF EXISTS vor CREATE)
-- ============================================================

-- Studio-Einstellungen (Singleton: immer nur 1 Zeile mit id=1)
CREATE TABLE IF NOT EXISTS public.studio_settings (
  id            INTEGER     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name          TEXT        DEFAULT 'FitBook',
  logo_emoji    TEXT        DEFAULT '⚡',
  logo_url      TEXT,
  primary_color TEXT        DEFAULT '#ff6b1a',
  description   TEXT        DEFAULT 'Dein Fitnessstudio. Deine Kurse. Deine Zeit.',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.studio_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.studio_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read settings"       ON public.studio_settings;
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.studio_settings;
DROP POLICY IF EXISTS "Authenticated can insert settings" ON public.studio_settings;

CREATE POLICY "Public can read settings"
  ON public.studio_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update settings"
  ON public.studio_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can insert settings"
  ON public.studio_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trainer-Tabelle
CREATE TABLE IF NOT EXISTS public.trainers (
  id             UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT         NOT NULL,
  role           TEXT,
  photo_url      TEXT,
  bio            TEXT,
  experience     TEXT,
  certifications TEXT[]       DEFAULT '{}',
  courses        TEXT[]       DEFAULT '{}',
  rating         NUMERIC(3,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  reviews        INTEGER      DEFAULT 0,
  schedule       TEXT[]       DEFAULT '{}',
  color          TEXT         DEFAULT '#ff6b1a',
  sort_order     INTEGER      DEFAULT 0,
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read trainers"          ON public.trainers;
DROP POLICY IF EXISTS "Authenticated can insert trainers" ON public.trainers;
DROP POLICY IF EXISTS "Authenticated can update trainers" ON public.trainers;
DROP POLICY IF EXISTS "Authenticated can delete trainers" ON public.trainers;

CREATE POLICY "Public can read trainers"
  ON public.trainers FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert trainers"
  ON public.trainers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update trainers"
  ON public.trainers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete trainers"
  ON public.trainers FOR DELETE USING (auth.role() = 'authenticated');

-- Beispiel-Trainer einspielen
INSERT INTO public.trainers (name, role, bio, experience, certifications, courses, rating, reviews, schedule, color, sort_order) VALUES
  ('Anna Bergmann',   'Yoga & Pilates',          'Anna ist zertifizierte Yoga- und Pilates-Trainerin und hat ihre Ausbildung in Indien und Berlin abgeschlossen. Ihre Kurse verbinden östliche Entspannungstechniken mit modernem Körperbewusstsein.',    '8 Jahre',  ARRAY['Yoga Alliance RYT-500','BASI Pilates','Atemtherapie'],              ARRAY['Yoga Flow','Pilates'],            4.9, 142, ARRAY['Mo 08:00','Mi 10:00','Fr 17:00','Sa 09:00'], '#a78bfa', 1),
  ('Markus Schreiber','CrossFit & Functional',   'Markus ist ehemaliger Leistungssportler und CrossFit Level-2-Trainer. Er motiviert mit strukturierten Workouts und legt großen Wert auf saubere Technik und Verletzungsprävention.',                   '6 Jahre',  ARRAY['CrossFit L2','NSCA-CSCS','Erste Hilfe'],                            ARRAY['CrossFit','Box-Fitness'],         4.8,  98, ARRAY['Mo 06:30','Di 18:00','Do 12:00','Sa 10:00'], '#f87171', 2),
  ('Sara Vogel',      'Spinning & Ausdauer',     'Sara ist lizenzierte Indoor-Cycling-Trainerin und Ernährungsberaterin. Sie gestaltet ihre Kurse mit motivierender Musik und progressiven Intervallprogrammen für alle Fitnesslevel.',                  '5 Jahre',  ARRAY['Spinning Certified','Ernährungsberaterin DGE','Herzkreislauf-Training'], ARRAY['Spinning'],                   4.9, 211, ARRAY['Di 07:00','Do 09:00','Fr 19:30','So 10:00'], '#34d399', 3),
  ('Julian Park',     'Box-Fitness & Kampfsport','Julian war Profiboxer und bringt seine Wettkampferfahrung direkt in den Unterricht ein. Seine Kurse sind ideal für alle, die Ausdauer, Koordination und Selbstverteidigung kombinieren wollen.',        '10 Jahre', ARRAY['Boxtrainer Lizenz BTSV','Personal Trainer IHK','Kampfsport DAN 3'],  ARRAY['Box-Fitness','CrossFit'],         4.7,  87, ARRAY['Mo 12:00','Mi 17:00','Fr 07:30','Sa 11:00'], '#fb923c', 4),
  ('Lena Hofmann',    'Zumba & Dance Fitness',   'Lena ist ausgebildete Tanzlehrerin und lizenzierte Zumba-Instruktorin. Ihre Kurse sind bekannt für die mitreißende Energie und positive Atmosphäre, die alle Niveaus willkommen heißt.',               '4 Jahre',  ARRAY['Zumba Instructor Network','Tanzpädagogin B.A.','Rhythmik & Bewegung'], ARRAY['Zumba'],                         5.0, 193, ARRAY['Di 10:00','Do 18:00','Sa 16:00','So 12:00'], '#e879f9', 5),
  ('Tobias Kern',     'Personal Training & Kraft','Tobias ist einer der erfahrensten Trainer im Studio. Als ehemaliger Profisportler und diplomierter Sportwissenschaftler bietet er individuelles Coaching auf höchstem Niveau.',                        '12 Jahre', ARRAY['Sportwissenschaft B.Sc.','Personal Trainer NASM','Rehabilitationssport'], ARRAY['CrossFit','Pilates','Yoga Flow'], 4.8, 156, ARRAY['Mo 09:00','Mi 14:00','Do 17:00','Fr 08:00'], '#fbbf24', 6)
ON CONFLICT DO NOTHING;
