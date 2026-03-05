-- Preuve de paiement (photo ou document scanné) pour les soumissions avec paiement
ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

COMMENT ON COLUMN public.publications.payment_proof_url IS 'URL de la preuve de paiement (image ou PDF) jointe par l''utilisateur lors de la soumission.';
