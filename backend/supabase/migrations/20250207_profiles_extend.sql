-- Extension du profil utilisateur : biographie, contact, réseaux, institution
-- Exécuter dans Supabase Dashboard > SQL Editor si la table profiles existe déjà

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS institution TEXT,
  ADD COLUMN IF NOT EXISTS domain_interest TEXT;

COMMENT ON COLUMN public.profiles.bio IS 'Biographie / présentation personnelle';
COMMENT ON COLUMN public.profiles.phone IS 'Téléphone (affichage public optionnel)';
COMMENT ON COLUMN public.profiles.location IS 'Ville ou pays';
COMMENT ON COLUMN public.profiles.website IS 'Site web personnel ou professionnel';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'Profil LinkedIn';
COMMENT ON COLUMN public.profiles.twitter_url IS 'Profil Twitter / X';
COMMENT ON COLUMN public.profiles.institution IS 'Établissement / organisation';
COMMENT ON COLUMN public.profiles.domain_interest IS 'Domaine(s) d''intérêt';
