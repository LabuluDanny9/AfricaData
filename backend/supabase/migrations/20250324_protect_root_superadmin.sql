-- Super administrateur principal : dtech00111@gmail.com
-- Aucun autre utilisateur (y compris role admin) ne peut supprimer ce profil
-- ni modifier son rôle / son e-mail. Le titulaire du compte (auth.uid() = id) conserve ces droits.

CREATE OR REPLACE FUNCTION public.enforce_root_superadmin_protection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  protected_email CONSTANT text := 'dtech00111@gmail.com';
  old_email_norm text;
  new_email_norm text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_email_norm := LOWER(TRIM(COALESCE(OLD.email, '')));
    IF old_email_norm = protected_email THEN
      RAISE EXCEPTION 'Le profil du super administrateur principal ne peut pas être supprimé.'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    old_email_norm := LOWER(TRIM(COALESCE(OLD.email, '')));
    new_email_norm := LOWER(TRIM(COALESCE(NEW.email, '')));
    IF old_email_norm = protected_email AND auth.uid() IS DISTINCT FROM OLD.id THEN
      IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Seul le titulaire du compte peut modifier le rôle du super administrateur principal.'
          USING ERRCODE = 'check_violation';
      END IF;
      IF new_email_norm IS DISTINCT FROM old_email_norm THEN
        RAISE EXCEPTION 'Seul le titulaire du compte peut modifier l''e-mail du super administrateur principal.'
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_protect_root_superadmin ON public.profiles;

CREATE TRIGGER tr_profiles_protect_root_superadmin
  BEFORE DELETE OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_root_superadmin_protection();

COMMENT ON FUNCTION public.enforce_root_superadmin_protection() IS 'Protège le compte super admin principal (dtech00111@gmail.com) contre suppression et destitution par d''autres admins.';
