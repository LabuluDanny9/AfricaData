-- Paramètres plateforme (paiement activé/désactivé, etc.)
-- Lecture : tous. Écriture : Super Admin uniquement.

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Lecture : tout le monde (pour que le wizard soumission puisse lire payment_enabled)
CREATE POLICY "platform_settings_select"
  ON public.platform_settings FOR SELECT USING (true);

-- Écriture : Super Admin uniquement (role = 'admin' dans profiles)
CREATE POLICY "platform_settings_insert_admin"
  ON public.platform_settings FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "platform_settings_update_admin"
  ON public.platform_settings FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Valeur par défaut : paiement activé
INSERT INTO public.platform_settings (key, value)
VALUES ('payment_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
