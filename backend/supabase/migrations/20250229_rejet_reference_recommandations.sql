-- Colonnes : recommandations admin pour resoumission, référence de publication pour resoumission sans paiement
-- Notification in-app à l'auteur lors du rejet (avec nom du profil, motifs et recommandations)

ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS admin_recommendations TEXT,
  ADD COLUMN IF NOT EXISTS reference_code TEXT;

COMMENT ON COLUMN public.publications.admin_recommendations IS 'Recommandations de l''administrateur pour permettre à l''auteur de resoumettre (après rejet).';
COMMENT ON COLUMN public.publications.reference_code IS 'Code de référence court (ex. A1B2C3D4E5F6) pour resoumission sans paiement après rejet.';

-- Remplir reference_code pour les lignes existantes
UPDATE public.publications
SET reference_code = upper(left(REPLACE(id::text, '-', ''), 12))
WHERE reference_code IS NULL;

-- Contrainte d'unicité et trigger pour les nouvelles lignes
CREATE UNIQUE INDEX IF NOT EXISTS idx_publications_reference_code ON public.publications(reference_code) WHERE reference_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_publication_reference_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.publications
  SET reference_code = upper(left(REPLACE(NEW.id::text, '-', ''), 12))
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_publication_reference_code ON public.publications;
CREATE TRIGGER trg_set_publication_reference_code
  AFTER INSERT ON public.publications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_publication_reference_code();

-- Notification à l'auteur lorsque sa publication est rejetée (message avec nom, titre, référence, motifs, recommandations)
CREATE OR REPLACE FUNCTION public.notify_author_publication_rejected()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  author_name TEXT;
  pub_ref TEXT;
  msg TEXT;
BEGIN
  IF NEW.status <> 'rejected' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'rejected' THEN
    RETURN NEW;
  END IF;
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, '') INTO author_name FROM public.profiles WHERE id = NEW.user_id LIMIT 1;
  pub_ref := COALESCE(NEW.reference_code, upper(left(REPLACE(NEW.id::text, '-', ''), 12)));

  msg :=
    'Madame, Monsieur, ' || nullif(trim(author_name), '') || E'\n\n'
    || 'Suite à l''examen de votre publication intitulée : « ' || COALESCE(NEW.title, 'Publication') || ' » (Ref. ' || pub_ref || '), '
    || 'nous vous informons que celle-ci n''a pas pu être validée à l''issue de l''évaluation éditoriale.' || E'\n\n'
    || 'Motifs de la décision :' || E'\n' || COALESCE(NULLIF(trim(NEW.admin_comment), ''), 'Non précisé.');
  IF NEW.admin_recommendations IS NOT NULL AND trim(NEW.admin_recommendations) <> '' THEN
    msg := msg || E'\n\nRecommandations pour une nouvelle soumission :' || E'\n' || trim(NEW.admin_recommendations);
  END IF;
  msg := msg || E'\n\n'
    || 'Nous vous invitons, si vous le souhaitez, à apporter les corrections nécessaires et à soumettre une version révisée. '
    || 'Vous pourrez utiliser le numéro de référence ci-dessus pour soumettre à nouveau sans frais.' || E'\n\n'
    || 'Nous vous remercions pour votre compréhension et restons disponibles pour toute information complémentaire.' || E'\n\n'
    || 'Cordialement, Le Comité Éditorial Africadata';

  INSERT INTO public.notifications (user_id, type, title, message, publication_id)
  VALUES (
    NEW.user_id,
    'publication_rejected',
    'Décision concernant votre publication – Africadata',
    msg,
    NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_publication_rejected ON public.publications;
CREATE TRIGGER on_publication_rejected
  AFTER UPDATE OF status, admin_comment, admin_recommendations
  ON public.publications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM 'rejected' AND NEW.status = 'rejected')
  EXECUTE FUNCTION public.notify_author_publication_rejected();
