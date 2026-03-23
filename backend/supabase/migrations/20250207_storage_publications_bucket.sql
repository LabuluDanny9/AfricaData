-- Bucket Storage "publications" pour les PDF des soumissions
-- IMPORTANT : Créez d'abord le bucket dans Supabase Dashboard > Storage > New bucket :
--   Nom : publications | Public : Oui
-- Puis exécutez cette migration pour les politiques.

-- Lecture publique des PDF (tout le monde peut voir les fichiers du bucket)
DROP POLICY IF EXISTS "Public read publications" ON storage.objects;
CREATE POLICY "Public read publications"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'publications');

-- Utilisateurs authentifiés peuvent uploader dans leur dossier (user_id/...)
DROP POLICY IF EXISTS "Authenticated upload publications" ON storage.objects;
CREATE POLICY "Authenticated upload publications"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'publications');

-- Mise à jour / suppression : propriétaire du dossier (premier segment du path = user_id)
DROP POLICY IF EXISTS "Users update own publication files" ON storage.objects;
CREATE POLICY "Users update own publication files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'publications' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own publication files" ON storage.objects;
CREATE POLICY "Users delete own publication files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'publications' AND (storage.foldername(name))[1] = auth.uid()::text);
