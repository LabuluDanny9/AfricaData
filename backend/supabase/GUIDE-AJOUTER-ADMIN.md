# Comment ajouter un administrateur (avec mot de passe)

Ce guide explique comment créer un compte **administrateur** dans Supabase (avec email + mot de passe) et lui attribuer un rôle admin : **Super Admin** (`admin`), **Admin éditorial** (`admin_editorial`) ou **Modérateur** (`moderator`).

---

## Méthode 1 : Créer un nouvel admin dans Supabase Dashboard

### Étape 1 : Créer l’utilisateur (Authentication)

1. Ouvrez **Supabase Dashboard** → votre projet.
2. Menu **Authentication** → **Users**.
3. Cliquez sur **Add user** → **Create new user**.
4. Renseignez :
   - **Email** : l’adresse de l’administrateur (ex. `admin@africadata.org`).
   - **Password** : choisissez un mot de passe **fort** (min. 6 caractères).
5. Cliquez sur **Create user**.

Un **profil** est en général créé automatiquement dans la table `profiles` (grâce au trigger `handle_new_user`) avec le rôle par défaut `chercheur`.

### Étape 2 : Donner le rôle admin au profil

1. Allez dans **Table Editor** → table **`profiles`**.
2. Trouvez la ligne dont la colonne **email** correspond à l’email saisi (ou **id** = l’UUID de l’utilisateur dans Authentication).
3. Dans la colonne **role**, remplacez `chercheur` par l’un des rôles admin :
   - **`admin`** → Super Admin (contrôle total)
   - **`admin_editorial`** → Admin éditorial (publications, pas utilisateurs/paramètres)
   - **`moderator`** → Modérateur (commentaires, modération)
4. Enregistrez (Save).

L’utilisateur peut maintenant se connecter sur **/connexion-admin** avec cet **email** et ce **mot de passe**.

---

## Méthode 2 : Via le SQL Editor (en une seule fois)

Vous pouvez créer l’utilisateur et son profil admin en SQL. **Attention** : dans Supabase, les utilisateurs sont normalement créés via l’API Auth (Dashboard ou `signUp`). La méthode la plus simple reste **Méthode 1** (Dashboard).

Si vous avez **déjà créé** l’utilisateur dans Authentication et voulez seulement lui donner un rôle admin, exécutez dans **SQL Editor** :

```sql
-- Remplacez l'email et le rôle (admin | admin_editorial | moderator)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@africadata.org';
```

Pour **vérifier** les comptes admin :

```sql
SELECT id, email, full_name, role
FROM public.profiles
WHERE role IN ('admin', 'admin_editorial', 'moderator');
```

---

## Méthode 3 : Utiliser un compte existant (inscrit sur le site)

Si la personne a déjà un compte (inscription sur AfricaData) :

1. **Supabase** → **Table Editor** → **profiles**.
2. Trouvez la ligne avec son **email**.
3. Passez la colonne **role** à **`admin`**, **`admin_editorial`** ou **`moderator`**.
4. Enregistrez.

Elle n’a **pas besoin de changer de mot de passe** : elle se connecte comme d’habitude sur **/connexion-admin** avec son email et son mot de passe actuel.

---

## Résumé

| Objectif | Où aller | Action |
|----------|-----------|--------|
| Créer un **nouvel** admin | Authentication → Users → Add user | Créer l’utilisateur (email + mot de passe) |
| Lui donner un rôle admin | Table Editor → profiles | Mettre **role** = `admin`, `admin_editorial` ou `moderator` |
| Utiliser un compte **existant** | Table Editor → profiles | Mettre **role** = `admin`, `admin_editorial` ou `moderator` |

**Connexion** : l’administrateur va sur **/connexion-admin** et se connecte avec son **email** et son **mot de passe**.
