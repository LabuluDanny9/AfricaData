# Configuration du stockage Supabase (Storage)

L’application utilise deux **buckets** Supabase Storage. Ils doivent être créés manuellement dans le Dashboard.

## 1. Bucket « avatars » (photo de profil)

1. Ouvrez votre projet sur [Supabase Dashboard](https://supabase.com/dashboard).
2. Allez dans **Storage** (menu de gauche).
3. Cliquez sur **New bucket**.
4. Renseignez :
   - **Name** : `avatars`
   - Cochez **Public bucket** (pour que les photos de profil soient accessibles par URL).
5. Cliquez sur **Create bucket**.

### Politiques d’accès (recommandé)

Après création du bucket, exécutez dans **SQL Editor** le fichier :

`backend/supabase/migrations/20250207_storage_avatars_policies.sql`

Cela autorise les utilisateurs connectés à uploader/modifier/supprimer leurs photos dans `avatars/{user_id}/...` et tout le monde à lire (bucket public).

---

## 2. Bucket « publications » (PDF des publications)

1. Même chemin : **Storage** → **New bucket**.
2. Renseignez :
   - **Name** : `publications`
   - Cochez **Public bucket**.
3. **Create bucket**.

### Politiques d’accès (recommandé)

Après création du bucket, exécutez dans **SQL Editor** le fichier :

`backend/supabase/migrations/20250207_storage_publications_bucket.sql`

Cela autorise les utilisateurs connectés à uploader des PDF dans leur dossier et tout le monde à lire les fichiers (bucket public).

---

## En cas d’erreur « Bucket not found »

Si vous voyez **Bucket not found** lors de l’upload de la photo de profil ou d’un PDF, c’est que le bucket concerné n’existe pas encore. Créez-le comme ci-dessus (`avatars` pour la photo, `publications` pour les PDF).
