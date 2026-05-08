-- =============================================
-- SETUP SUPABASE — Rapports Kourel
-- Exécuter dans Supabase > SQL Editor
-- =============================================

-- Table des kourels
CREATE TABLE IF NOT EXISTS kourels (
  id        SERIAL PRIMARY KEY,
  nom       TEXT NOT NULL,
  responsable TEXT NOT NULL,
  actif     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table du programme annuel par kourel
CREATE TABLE IF NOT EXISTS programme_annuel (
  id          SERIAL PRIMARY KEY,
  kourel_id   INTEGER NOT NULL REFERENCES kourels(id) ON DELETE CASCADE,
  nom         TEXT NOT NULL,
  melodie     TEXT NOT NULL,
  ordre       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE kourels         ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_annuel ENABLE ROW LEVEL SECURITY;

-- Lecture publique (utilisateurs non connectés peuvent lire)
CREATE POLICY "kourels_read_public"
  ON kourels FOR SELECT USING (true);

CREATE POLICY "programme_read_public"
  ON programme_annuel FOR SELECT USING (true);

-- Kourels : écriture réservée aux admins connectés
CREATE POLICY "kourels_write_admin"
  ON kourels FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Programme annuel : écriture ouverte (responsable sans compte peut gérer son programme)
CREATE POLICY "programme_write_all"
  ON programme_annuel FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- DONNÉES INITIALES (optionnel)
-- =============================================
INSERT INTO kourels (nom, responsable) VALUES
  ('Kourel 1',                    'Elhadji NDIAYE'),
  ('Kourel 2',                    'Abdoul Hakim BABOU'),
  ('Kourel 3',                    'Malang DIATTA'),
  ('Kourel 4',                    'M. Falilou SEYE'),
  ('Kourel Touba Parcelles',      'Bassirou DIOUM'),
  ('Kourel Sokhna Astou Gawane',  'Bassirou DIOUM')
ON CONFLICT DO NOTHING;
