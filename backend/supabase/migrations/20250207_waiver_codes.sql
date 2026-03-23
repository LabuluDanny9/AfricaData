-- Codes de publication gratuite : générés par le Super Admin, utilisables à la soumission
-- Un code = une utilisation (publication sans paiement)

CREATE TABLE IF NOT EXISTS public.waiver_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waiver_codes_code ON public.waiver_codes(code);
CREATE INDEX IF NOT EXISTS idx_waiver_codes_used_at ON public.waiver_codes(used_at) WHERE used_at IS NULL;

COMMENT ON TABLE public.waiver_codes IS 'Codes de dispense de paiement pour publication, générés par le Super Admin';

ALTER TABLE public.waiver_codes ENABLE ROW LEVEL SECURITY;

-- Seul le Super Admin peut voir tous les codes et en créer
CREATE POLICY "Admin select waiver_codes"
  ON public.waiver_codes FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin insert waiver_codes"
  ON public.waiver_codes FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Fonction : générer un code (8 caractères alphanumériques)
CREATE OR REPLACE FUNCTION public.generate_waiver_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INT;
BEGIN
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;
  LOOP
    new_code := '';
    FOR i IN 1..8 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM public.waiver_codes WHERE code = new_code) THEN
      INSERT INTO public.waiver_codes (code, created_by)
      VALUES (new_code, auth.uid());
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Vérifier si un code est valide (non utilisé)
CREATE OR REPLACE FUNCTION public.check_waiver_code(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.waiver_codes
    WHERE code = trim(p_code) AND used_at IS NULL
  );
END;
$$;

-- Utiliser un code (marquer comme utilisé)
CREATE OR REPLACE FUNCTION public.use_waiver_code(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated INT;
BEGIN
  UPDATE public.waiver_codes
  SET used_at = now()
  WHERE code = trim(p_code) AND used_at IS NULL;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

COMMENT ON FUNCTION public.generate_waiver_code() IS 'Génère un code de publication gratuite (Super Admin uniquement)';
COMMENT ON FUNCTION public.check_waiver_code(TEXT) IS 'Vérifie si un code est valide et non encore utilisé';
COMMENT ON FUNCTION public.use_waiver_code(TEXT) IS 'Marque un code comme utilisé (une seule utilisation par code)';
