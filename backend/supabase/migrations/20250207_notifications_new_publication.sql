-- Notifications utilisateur : à chaque nouvelle publication (status = published),
-- chaque utilisateur reçoit une notification avec lien vers la publication.

-- Table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'new_publication',
  title TEXT NOT NULL,
  message TEXT,
  publication_id UUID REFERENCES public.publications(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- L'utilisateur ne voit que ses propres notifications
CREATE POLICY "User read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- L'utilisateur peut marquer ses notifications comme lues (UPDATE read_at)
CREATE POLICY "User update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seul le trigger (SECURITY DEFINER) peut insérer
CREATE POLICY "Service insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (false);

-- Fonction : notifier tous les utilisateurs (profiles) d'une nouvelle publication
CREATE OR REPLACE FUNCTION public.notify_users_new_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  pub_title TEXT := COALESCE(NEW.title, 'Nouvelle publication');
BEGIN
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;
  -- Ne notifier qu'une fois : à l'INSERT (nouvelle ligne published) ou à l'UPDATE (passage à published)
  IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN
    RETURN NEW;
  END IF;

  FOR rec IN SELECT id FROM public.profiles
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, publication_id)
    VALUES (
      rec.id,
      'new_publication',
      'Nouvelle publication sur AfricaData',
      '« ' || left(pub_title, 120) || (CASE WHEN length(pub_title) > 120 THEN '…' ELSE '' END) || ' » est en ligne.',
      NEW.id
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Trigger : après INSERT ou UPDATE sur publications, si status = published
DROP TRIGGER IF EXISTS on_publication_published ON public.publications;
CREATE TRIGGER on_publication_published
  AFTER INSERT OR UPDATE OF status
  ON public.publications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_new_publication();

-- Activer Realtime : notifications (live dans l'app) et publications (actualisation librairie/accueil)
-- Si une table est déjà dans supabase_realtime, commenter la ligne correspondante pour éviter l'erreur.
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.publications;
