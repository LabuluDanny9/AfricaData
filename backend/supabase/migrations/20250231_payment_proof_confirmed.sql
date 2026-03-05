-- Confirmation de la preuve de paiement par l'administrateur (paramètre de base avant étude complète).

ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS payment_proof_confirmed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_proof_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_proof_confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.publications.payment_proof_confirmed IS 'Preuve de paiement confirmée par l''administrateur (étape préalable à l''étude éditoriale).';
COMMENT ON COLUMN public.publications.payment_proof_confirmed_at IS 'Date/heure de confirmation de la preuve de paiement par l''admin.';
COMMENT ON COLUMN public.publications.payment_proof_confirmed_by IS 'Identifiant de l''administrateur ayant confirmé la preuve de paiement.';
