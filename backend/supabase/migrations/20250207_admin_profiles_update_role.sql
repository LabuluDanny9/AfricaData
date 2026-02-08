-- S'assurer que le Super Admin peut modifier le rôle de n'importe quel utilisateur sans blocage
-- WITH CHECK (true) : la ligne mise à jour peut avoir n'importe quelle valeur de rôle

DROP POLICY IF EXISTS "Admin update any profile" ON public.profiles;

CREATE POLICY "Admin update any profile"
  ON public.profiles
  FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK (true);

COMMENT ON POLICY "Admin update any profile" ON public.profiles IS 'Super Admin peut changer le rôle (et autres champs) de tout profil';
