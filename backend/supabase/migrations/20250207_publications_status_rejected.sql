-- Ajouter le statut 'rejected' aux publications (spec Admin : rejeter avec commentaire)
ALTER TABLE public.publications DROP CONSTRAINT IF EXISTS publications_status_check;
ALTER TABLE public.publications ADD CONSTRAINT publications_status_check
  CHECK (status IN ('draft', 'published', 'rejected'));
