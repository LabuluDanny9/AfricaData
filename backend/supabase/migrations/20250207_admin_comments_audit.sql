-- Admin peut supprimer une publication (modération)
DROP POLICY IF EXISTS "Admin delete any publication" ON public.publications;
CREATE POLICY "Admin delete any publication"
  ON public.publications FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Colonne hidden sur les commentaires (modération)
ALTER TABLE public.publication_comments
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- Admin / modérateur peuvent mettre à jour (masquer) et supprimer les commentaires
DROP POLICY IF EXISTS "Admin update comments" ON public.publication_comments;
CREATE POLICY "Admin update comments"
  ON public.publication_comments FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'admin_editorial', 'moderator'));

DROP POLICY IF EXISTS "Admin delete comments" ON public.publication_comments;
CREATE POLICY "Admin delete comments"
  ON public.publication_comments FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'admin_editorial', 'moderator'));

-- Table audit_logs (admin_id, action, target_type, target_id, ip, created_at)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read audit logs"
  ON public.audit_logs FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'admin_editorial', 'moderator'));
