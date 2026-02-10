-- Ajouter la colonne hidden à publication_comments (modération)
-- À exécuter si l'interface modération affiche : column publication_comments.hidden does not exist

ALTER TABLE public.publication_comments
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- Politiques pour que les admins/modérateurs puissent mettre à jour (masquer) et supprimer les commentaires
DROP POLICY IF EXISTS "Admin update comments" ON public.publication_comments;
CREATE POLICY "Admin update comments"
  ON public.publication_comments FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'admin_editorial', 'moderator'));

DROP POLICY IF EXISTS "Admin delete comments" ON public.publication_comments;
CREATE POLICY "Admin delete comments"
  ON public.publication_comments FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'admin_editorial', 'moderator'));
