-- Admin (Super Admin) peut modifier et supprimer les profils utilisateurs
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Admin peut mettre à jour n'importe quel profil (changer rôle, etc.)
DROP POLICY IF EXISTS "Admin update any profile" ON public.profiles;
CREATE POLICY "Admin update any profile"
  ON public.profiles FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Admin peut supprimer n'importe quel profil (gestion utilisateurs)
DROP POLICY IF EXISTS "Admin delete any profile" ON public.profiles;
CREATE POLICY "Admin delete any profile"
  ON public.profiles FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
