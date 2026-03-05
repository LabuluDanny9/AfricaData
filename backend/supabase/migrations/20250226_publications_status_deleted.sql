-- Autoriser le statut 'deleted' pour la suppression logique par l'admin
ALTER TABLE public.publications DROP CONSTRAINT IF EXISTS publications_status_check;
ALTER TABLE public.publications ADD CONSTRAINT publications_status_check
  CHECK (status IN ('draft', 'published', 'rejected', 'deleted'));
