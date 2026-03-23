-- Photo de l'auteur (optionnelle) pour les publications
ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS author_photo_url TEXT;

COMMENT ON COLUMN public.publications.author_photo_url IS 'URL publique de la photo de l''auteur (optionnel). Si absent, afficher un avatar par défaut.';
