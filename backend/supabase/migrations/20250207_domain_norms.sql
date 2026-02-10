-- Normes / modalités de publication par domaine (pour conformité et outil Examiner)
-- Lecture : tous. Écriture : Super Admin uniquement.

CREATE TABLE IF NOT EXISTS public.domain_norms (
  domain TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.domain_norms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domain_norms_select"
  ON public.domain_norms FOR SELECT USING (true);

CREATE POLICY "domain_norms_insert_admin"
  ON public.domain_norms FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "domain_norms_update_admin"
  ON public.domain_norms FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Contenu par défaut (exemples) pour quelques domaines
INSERT INTO public.domain_norms (domain, content) VALUES
  ('Informatique', 'Titre explicite (≥10 caractères). Résumé structuré (objectif, méthode, résultats). Document PDF en français ou anglais. Références bibliographiques recommandées.'),
  ('Sciences économiques', 'Titre clair. Résumé avec problématique et conclusions. Données et méthodologie précisées. PDF complet avec bibliographie.'),
  ('Médecine & Santé', 'Titre descriptif. Résumé (contexte, objectifs, méthode, résultats, conclusion). Conformité éthique si applicable. PDF avec références.'),
  ('Environnement', 'Titre et résumé explicites. Méthodologie et zone d''étude indiquées. Résultats et recommandations. PDF avec figures/tables si pertinent.')
ON CONFLICT (domain) DO NOTHING;
