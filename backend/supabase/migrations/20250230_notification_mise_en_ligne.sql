-- Notification à l'auteur lorsque sa publication est mise en ligne (status = published) :
-- "Votre publication est désormais en ligne" avec nom du profil, titre, et indication du lien (lien géré par l'app via publication_id).

CREATE OR REPLACE FUNCTION public.notify_users_new_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  pub_title TEXT := COALESCE(NEW.title, 'Publication');
  author_name TEXT;
  online_message TEXT;
BEGIN
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN
    RETURN NEW;
  END IF;

  -- Notification dédiée à l'auteur : mise en ligne (titre, nom du profil, lien via l'app)
  IF NEW.user_id IS NOT NULL THEN
    SELECT COALESCE(NULLIF(trim(full_name), ''), '') INTO author_name FROM public.profiles WHERE id = NEW.user_id LIMIT 1;
    online_message :=
      'Madame, Monsieur' || CASE WHEN author_name <> '' THEN ', ' || author_name ELSE '' END || E'\n\n'
      || 'Nous avons le plaisir de vous informer que votre publication :' || E'\n\n'
      || '« ' || pub_title || ' »' || E'\n\n'
      || 'est désormais officiellement publiée et accessible en ligne sur la plateforme Africadata.' || E'\n\n'
      || 'Votre travail est maintenant consultable par la communauté académique via notre bibliothèque numérique.' || E'\n\n'
      || 'Lien d''accès : consultez votre publication dans l''application (bouton "Voir la publication" ci-dessous).' || E'\n\n'
      || 'Nous vous remercions pour votre contribution au rayonnement scientifique et vous encourageons à continuer à partager vos travaux avec la communauté.' || E'\n\n'
      || 'Cordialement, L''équipe Africadata';
    INSERT INTO public.notifications (user_id, type, title, message, publication_id)
    VALUES (
      NEW.user_id,
      'publication_online',
      'Votre publication est désormais en ligne – Africadata',
      online_message,
      NEW.id
    );
  END IF;

  -- Notification à tous (sauf l'auteur) : nouvelle publication en ligne
  FOR rec IN SELECT id FROM public.profiles WHERE id IS NOT NULL AND (NEW.user_id IS NULL OR id <> NEW.user_id)
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
