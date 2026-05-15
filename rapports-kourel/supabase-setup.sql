-- =============================================
-- SETUP SUPABASE — Rapports Kourel
-- Exécuter dans Supabase > SQL Editor (tout d'un bloc)
-- =============================================

-- =============================================
-- 1. PROFILS UTILISATEURS (roles)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'membre'
             CHECK (role IN ('admin', 'dieuwrigne', 'membre')),
  prenom     TEXT,
  nom        TEXT,
  telephone  TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Création automatique d'un profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'membre');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Lecture profil par l'utilisateur lui-même
CREATE POLICY "profiles_read_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- =============================================
-- 2. KOURELS
-- =============================================
CREATE TABLE IF NOT EXISTS kourels (
  id          SERIAL PRIMARY KEY,
  nom         TEXT NOT NULL UNIQUE,
  responsable TEXT NOT NULL,
  actif       BOOLEAN DEFAULT true,
  telephone   TEXT,
  callmebot_apikey TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE kourels ADD CONSTRAINT kourels_nom_key UNIQUE (nom);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS programme_annuel (
  id          SERIAL PRIMARY KEY,
  kourel_id   INTEGER NOT NULL REFERENCES kourels(id) ON DELETE CASCADE,
  nom         TEXT NOT NULL,
  melodie     TEXT NOT NULL,
  ordre       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3. MEMBRES DU COMITÉ
-- =============================================
CREATE TABLE IF NOT EXISTS membres (
  id        SERIAL PRIMARY KEY,
  prenom    TEXT NOT NULL,
  nom       TEXT NOT NULL,
  kourel    TEXT,
  telephone TEXT,
  statut    TEXT DEFAULT 'actif'
             CHECK (statut IN ('actif', 'inactif')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 4. TYPES D'ÉVÉNEMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS types_evenements (
  id          SERIAL PRIMARY KEY,
  nom         TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE types_evenements ADD CONSTRAINT types_evenements_nom_key UNIQUE (nom);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

-- =============================================
-- 5. LIEUX
-- =============================================
CREATE TABLE IF NOT EXISTS lieux (
  id  SERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE
);

-- =============================================
-- 6. ÉVÉNEMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS evenements (
  id             SERIAL PRIMARY KEY,
  type_id        INTEGER NOT NULL REFERENCES types_evenements(id) ON DELETE CASCADE,
  date_evenement DATE NOT NULL,
  lieu_id        INTEGER REFERENCES lieux(id) ON DELETE SET NULL,
  statut         TEXT DEFAULT 'à venir'
                  CHECK (statut IN ('à venir', 'en cours', 'terminé')),
  conclusion     TEXT,
  note_definitive NUMERIC(3,1),
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 7. LIEN ÉVÉNEMENTS ↔ KOURELS (plusieurs kourels par événement)
-- =============================================
CREATE TABLE IF NOT EXISTS evenement_kourels (
  id           SERIAL PRIMARY KEY,
  evenement_id INTEGER NOT NULL REFERENCES evenements(id) ON DELETE CASCADE,
  kourel_id    INTEGER NOT NULL REFERENCES kourels(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(evenement_id, kourel_id)
);

-- =============================================
-- 8. LIEN MEMBRES ↔ (ÉVÉNEMENT × KOUREL) (rôle + code)
-- =============================================
CREATE TABLE IF NOT EXISTS eval_membres (
  id                  SERIAL PRIMARY KEY,
  evenement_kourel_id INTEGER NOT NULL REFERENCES evenement_kourels(id) ON DELETE CASCADE,
  membre_id           INTEGER NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
  role                TEXT NOT NULL CHECK (role IN ('evaluateur', 'paginateur')),
  code_acces          TEXT UNIQUE,
  UNIQUE(evenement_kourel_id, membre_id, role)
);

-- =============================================
-- 9. CRITÈRES / SECTIONS D'ÉVALUATION
-- =============================================
CREATE TABLE IF NOT EXISTS criteres (
  id          SERIAL PRIMARY KEY,
  section_nom TEXT NOT NULL UNIQUE,
  description TEXT,
  ordre       INTEGER DEFAULT 0,
  actif       BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE criteres ADD CONSTRAINT criteres_section_nom_key UNIQUE (section_nom);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

-- =============================================
-- 10. ÉVALUATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS evaluations (
  id           SERIAL PRIMARY KEY,
  evenement_id INTEGER NOT NULL REFERENCES evenements(id) ON DELETE CASCADE,
  membre_id    INTEGER NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
  commentaire  TEXT,
  soumis       BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(evenement_id, membre_id)
);

-- Détail : note par critère
CREATE TABLE IF NOT EXISTS evaluation_notes (
  id            SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  critere_id    INTEGER NOT NULL REFERENCES criteres(id) ON DELETE CASCADE,
  appreciation  TEXT,
  note          DECIMAL(3,1) CHECK (note IS NULL OR (note >= 0 AND note <= 10)),
  remarques     TEXT,
  UNIQUE(evaluation_id, critere_id)
);

-- =============================================
-- 11. INDEX
-- =============================================
CREATE INDEX IF NOT EXISTS idx_evenements_type           ON evenements(type_id);
CREATE INDEX IF NOT EXISTS idx_evenement_kourels_event   ON evenement_kourels(evenement_id);
CREATE INDEX IF NOT EXISTS idx_evenement_kourels_kourel  ON evenement_kourels(kourel_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evenement     ON evaluations(evenement_id);
CREATE INDEX IF NOT EXISTS idx_eval_notes_evaluation     ON evaluation_notes(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_eval_membres_ek           ON eval_membres(evenement_kourel_id);

-- =============================================
-- 11. ROW LEVEL SECURITY
-- =============================================
ALTER TABLE kourels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_annuel  ENABLE ROW LEVEL SECURITY;
ALTER TABLE membres           ENABLE ROW LEVEL SECURITY;
ALTER TABLE types_evenements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lieux             ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenement_kourels  ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_membres      ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteres          ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_notes  ENABLE ROW LEVEL SECURITY;

-- ── Lectures publiques (SELECT pour tout le monde) ──────────────────────────
CREATE POLICY "select_public"
  ON kourels FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON programme_annuel FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON membres FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON types_evenements FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON lieux FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON evenements FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON evenement_kourels FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON eval_membres FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON criteres FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON evaluations FOR SELECT USING (true);

CREATE POLICY "select_public"
  ON evaluation_notes FOR SELECT USING (true);

-- ── Évaluations : écriture publique via code d'accès (option A) ──────────
CREATE POLICY "insert_evaluation_public"
  ON evaluations FOR INSERT
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "update_evaluation_public"
  ON evaluations FOR UPDATE
  USING (auth.role() = 'anon')
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "insert_evaluation_notes_public"
  ON evaluation_notes FOR INSERT
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "update_evaluation_notes_public"
  ON evaluation_notes FOR UPDATE
  USING (auth.role() = 'anon')
  WITH CHECK (auth.role() = 'anon');

-- ── Écriture réservée aux utilisateurs connectés (auth) ─────────────────────
CREATE POLICY "write_auth"
  ON kourels FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON programme_annuel FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON membres FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON types_evenements FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON lieux FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON evenements FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON evenement_kourels FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON eval_membres FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON criteres FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON evaluations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "write_auth"
  ON evaluation_notes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- 12. DONNÉES INITIALES
-- =============================================
INSERT INTO kourels (nom, responsable) VALUES
  ('Kourel 1',                    'Baye Modou DIENG'),
  ('Kourel 2',                    'Abdoul Hakim BABOU'),
  ('Kourel 3',                    'Malang DIATTA'),
  ('Kourel 4',                    'M. Falilou SEYE'),
  ('Kourel Touba Parcelles',      'Bassirou DIOUM'),
  ('Kourel Sokhna Astou Gawane',  'Bassirou DIOUM')
ON CONFLICT (nom) DO NOTHING;

INSERT INTO types_evenements (nom, description) VALUES
  ('Goudi aldiouma', 'Rassemblement chaque Jeudi soir de récitation de Khassidas'),
  ('Ziar',           'Visite spirituelle chez un guide religieux'),
  ('Magal',          'Célébration commémorative du grand Magal de Touba'),
  ('Gamou',          'Célébration de la naissance du Prophète Mouhamed (PSL)'),
  ('Yawma Achoura',  'Tamkharit'),
  ('Kazu Razab',     'Magal Kazu Razab'),
  ('Laylatoul Khadr','Célébration de la nuit du destin')
ON CONFLICT (nom) DO NOTHING;

INSERT INTO lieux (nom) VALUES
  ('CAMPUS'),
  ('ESP'),
  ('TOUBA'),
  ('KHABANE'),
  ('BOUSTANE'),
  ('MBACKE')
ON CONFLICT (nom) DO NOTHING;

INSERT INTO criteres (section_nom, description, ordre) VALUES
  ('Maitrise de la mélodie',    'Qualité de la restitution mélodique',     1),
  ('Phonétique "Hourouf"',      'Qualité de la prononciation et justesse',  2),
  ('Temps de prestation',       'Respect du timing moyen attendu',          3),
  ('Discipline',                'Comportement et respect des règles',       4),
  ('Ponctualité / Présence',    'Assiduité et ponctualité des membres',     5),
  ('Appréciation générale',     'Évaluation globale de la prestation',      6)
ON CONFLICT (section_nom) DO NOTHING;
