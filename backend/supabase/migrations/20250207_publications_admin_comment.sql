-- Commentaire admin lors du rejet d'une publication (visible par l'auteur dans Mes publications)
ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS admin_comment TEXT;

COMMENT ON COLUMN public.publications.admin_comment IS 'Commentaire de l''administrateur en cas de rejet (visible par l''auteur)';
