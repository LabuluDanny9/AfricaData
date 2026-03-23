-- Politiques RLS pour le super-administrateur
-- Permet à un utilisateur avec role = 'admin' (dans profiles) de lire et modifier toutes les publications.

-- Admin peut lire toutes les publications (y compris brouillons)
DROP POLICY IF EXISTS "Admin read all publications" ON public.publications;
CREATE POLICY "Admin read all publications"
  ON public.publications FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Supprimer l'ancienne politique SELECT si elle existe (pour éviter conflit)
-- Note: la politique "Publications publiées lisibles par tous" autorise (status = 'published' OR user_id = auth.uid())
-- On ajoute une politique supplémentaire pour admin. Si plusieurs politiques SELECT existent, OR est appliqué.

-- Admin peut mettre à jour toute publication (modération)
DROP POLICY IF EXISTS "Admin update any publication" ON public.publications;
CREATE POLICY "Admin update any publication"
  ON public.publications FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
