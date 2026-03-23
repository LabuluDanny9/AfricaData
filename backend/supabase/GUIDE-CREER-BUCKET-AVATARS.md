# Guide : Créer le bucket « avatars » dans Supabase

Ce guide vous montre **étape par étape** comment créer le bucket Storage pour que les photos de profil s’affichent correctement.

---

## Étape 1 : Ouvrir Supabase

1. Allez sur **https://supabase.com**
2. Cliquez sur **Sign in** (ou **Log in**) si besoin, et connectez-vous.
3. Sur le tableau de bord, cliquez sur **votre projet** (celui utilisé par AfricaData).

---

## Étape 2 : Aller dans Storage

1. Dans le **menu de gauche**, repérez l’icône **Storage** (dossier / stockage).
2. Cliquez sur **Storage**.

![Menu : Storage est dans la colonne de gauche]

---

## Étape 3 : Créer un nouveau bucket

1. En haut à droite de la page Storage, cliquez sur le bouton **New bucket** (ou **Create a new bucket**).
2. Une fenêtre ou un formulaire s’ouvre pour configurer le bucket.

---

## Étape 4 : Renseigner le nom et les options

1. **Name** (Nom du bucket)  
   - Saisissez **exactement** : `avatars`  
   - Tout en minuscules, sans espace.

2. **Public bucket**  
   - Cochez la case **Public bucket**.  
   - Cela permet à l’application d’afficher les photos de profil via une URL publique.

3. Ne changez pas les autres options (vous pouvez laisser les valeurs par défaut).

4. Cliquez sur **Create bucket** (ou **Save** / **Créer**).

---

## Étape 5 : Vérifier

1. Vous devez voir le bucket **avatars** dans la liste des buckets.
2. Retournez dans l’application AfricaData.
3. Allez sur **Profil** et essayez à nouveau d’**uploader une photo** : l’erreur « Bucket not found » ne devrait plus apparaître.

---

## Résumé rapide

| Où aller | Action |
|----------|--------|
| **Supabase** → **Votre projet** | Ouvrir le projet |
| **Menu gauche** → **Storage** | Ouvrir le stockage |
| **New bucket** | Créer un bucket |
| **Name** = `avatars` | Nom exact du bucket |
| **Public bucket** = coché | Rendre les fichiers accessibles |
| **Create bucket** | Valider |

---

## (Optionnel) Sécuriser les uploads avec des politiques

Après avoir créé le bucket, vous pouvez ajouter des règles d’accès :

1. Dans Supabase, ouvrez **SQL Editor** (menu de gauche).
2. Créez une nouvelle requête.
3. Copiez-collez le contenu du fichier :  
   `backend/supabase/migrations/20250207_storage_avatars_policies.sql`
4. Cliquez sur **Run** pour exécuter le script.

Cela permet aux utilisateurs connectés d’uploader uniquement dans leur propre dossier (`avatars/{user_id}/...`).

---

## Problèmes fréquents

- **Je ne vois pas Storage**  
  Vérifiez que vous êtes bien dans le bon projet Supabase.

- **Le nom doit être exact**  
  `avatars` en minuscules, sans espace. Pas `Avatars` ni `avatar`.

- **L’erreur persiste après création**  
  Rechargez la page de l’application (F5) et réessayez l’upload.

- **Erreur « permission denied » ou « policy » après création du bucket**  
  Exécutez le fichier SQL des politiques (voir section « Optionnel » ci-dessus).

---

## La photo ne s’affiche toujours pas

1. **Vérifier que le bucket est bien Public**  
   Dans Supabase → Storage → bucket **avatars** → Configuration : l’option **Public bucket** doit être cochée. Sans cela, les URLs des images ne fonctionnent pas.

2. **Recharger la page**  
   Après avoir créé le bucket ou modifié les options, rechargez la page de l’application (F5) puis réessayez d’uploader une photo.

3. **Vérifier la console du navigateur**  
   Ouvrez les outils développeur (F12) → onglet **Console**. Si vous voyez des erreurs 403 ou 404 sur une URL contenant `storage` ou `avatars`, le bucket n’est pas public ou le fichier n’existe pas.

4. **Ré-uploader la photo**  
   Si une ancienne URL est enregistrée alors que le bucket n’existait pas encore, allez sur **Profil**, cliquez sur la zone photo et uploadez à nouveau une image. L’application enregistre alors la nouvelle URL.
