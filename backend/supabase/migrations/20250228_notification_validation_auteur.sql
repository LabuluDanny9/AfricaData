-- À la validation d'une publication (status = published), l'auteur reçoit une notification
-- "Validation de votre publication" avec le texte officiel (titre + référence).

CREATE OR REPLACE FUNCTION public.notify_users_new_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  pub_title TEXT := COALESCE(NEW.title, 'Publication');
  pub_ref TEXT := 'Ref. ' || upper(left(REPLACE(NEW.id::text, '-', ''), 12));
  validation_message TEXT;
BEGIN
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN
    RETURN NEW;
  END IF;

  -- Notification dédiée à l'auteur : validation officielle (titre + référence)
  IF NEW.user_id IS NOT NULL THEN
    validation_message :=
      'Nous avons le plaisir de vous informer que votre publication intitulée : « ' || pub_title || ' » (' || pub_ref || ') '
      || 'a été examinée par notre comité éditorial et a reçu un avis favorable. '
      || 'Votre document répond aux critères scientifiques et éditoriaux établis par Africadata. '
      || 'Il est désormais en attente de mise en ligne officielle dans notre bibliothèque numérique. '
      || 'Vous serez informé(e) dès que la publication sera accessible au public. '
      || 'Nous vous félicitons pour la qualité de votre contribution et vous remercions de participer activement au développement scientifique. '
      || 'Cordialement, Le Comité Éditorial Africadata';
    INSERT INTO public.notifications (user_id, type, title, message, publication_id)
    VALUES (
      NEW.user_id,
      'publication_validated',
      'Validation de votre publication – Africadata',
      validation_message,
      NEW.id
    );
  END IF;

  -- Notification à tous (sauf l'auteur, qui a déjà reçu la validation) : nouvelle publication en ligne
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
