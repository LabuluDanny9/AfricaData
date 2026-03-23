-- Extension des rôles : Super Admin, Admin éditorial, Modérateur
-- Exécuter dans Supabase Dashboard > SQL Editor

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'chercheur', 'lecteur', 'editeur', 'institution',
    'admin', 'admin_editorial', 'moderator'
  ));

COMMENT ON COLUMN public.profiles.role IS 'admin = Super Admin, admin_editorial = Admin éditorial, moderator = Modérateur';
