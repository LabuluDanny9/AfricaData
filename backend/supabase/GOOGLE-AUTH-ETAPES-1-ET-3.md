# Comprendre l'étape 1 et l'étape 3 — Connexion Google

Ce document explique **en termes simples** ce que vous devez faire à l’**étape 1** (Google Cloud) et à l’**étape 3** (URLs de redirection Supabase).

---

## Étape 1 — Google Cloud : à quoi ça sert ?

**But :** obtenir deux valeurs que vous donnerez ensuite à Supabase :

- **Client ID** (identifiant client)
- **Client Secret** (code secret client)

Sans ces deux valeurs, le bouton « Se connecter avec Google » ne peut pas fonctionner.

### En pratique, vous faites 3 choses dans Google Cloud :

**A) Créer ou choisir un projet**

- Allez sur https://console.cloud.google.com/
- En haut, vous voyez le nom d’un projet (ex. « Mon projet »).
- Si vous n’avez pas de projet : cliquez dessus → **Nouveau projet** → donnez un nom (ex. AfricaData) → **Créer**.
- Si vous en avez déjà un : sélectionnez-le.

**B) Configurer l’« écran de consentement » (une seule fois)**

- Menu de gauche : **APIs et services** → **Écran de consentement OAuth**.
- Type : **Externe**.
- Remplissez au moins : nom de l’app (ex. AfricaData), votre email (assistance et développeur).
- Dans **Domaines autorisés**, ajoutez : **supabase.co** (sans `https://`).
- Enregistrez (Enregistrer et continuer jusqu’à la fin).

**C) Créer les identifiants (Client ID et Secret)**

- Menu de gauche : **APIs et services** → **Identifiants**.
- **+ Créer des identifiants** → **ID client OAuth**.
- Type : **Application Web**.
- **Origines JavaScript autorisées** : ajoutez `http://localhost:3000` (et votre URL de production si vous en avez une).
- **URI de redirection autorisés** : c’est le point le plus important.
  - Ouvrez Supabase (https://supabase.com/dashboard) → votre projet → **Authentication** → **Providers** → **Google**.
  - Vous voyez une ligne **Callback URL** (ex. `https://xxxxx.supabase.co/auth/v1/callback`).
  - **Copiez cette URL** et **collez-la** dans « URI de redirection autorisés » dans Google Cloud (sans rien modifier).
- Cliquez sur **Créer**.
- Une fenêtre affiche **Client ID** et **Client Secret** → copiez-les et gardez-les pour l’étape 2 (Supabase).

**Résumé étape 1 :** vous créez un « passe » (Client ID + Secret) dans Google, et vous dites à Google : « après connexion, renvoie l’utilisateur vers cette adresse Supabase » (Callback URL). C’est pour ça qu’il faut copier l’URL de Supabase dans Google.

---

## Étape 3 — Supabase « URLs de redirection » : à quoi ça sert ?

**But :** dire à Supabase vers **quelles pages de votre site** il a le droit d’envoyer l’utilisateur après qu’il s’est connecté avec Google.

Sans cette liste, Supabase refuse de rediriger et vous pouvez avoir une erreur ou une page blanche.

### Où le faire

- Supabase : https://supabase.com/dashboard → votre projet.
- Menu gauche : **Authentication** → **URL Configuration** (souvent en bas sous « Authentication »).

### Deux champs à remplir

**1) Site URL**

- C’est l’adresse de la page d’accueil de votre application.
- En local : mettez **`http://localhost:3000`**
- En production : mettez l’URL de votre site (ex. **`https://mon-app.vercel.app`**).

**2) Redirect URLs**

- C’est une **liste** d’adresses autorisées.
- Supabase ne peut renvoyer l’utilisateur **que** vers des adresses qui sont dans cette liste.
- Cliquez sur « Add URL » (ou le champ prévu) et ajoutez **une URL par ligne**, par exemple :

  Pour le développement en local :

  - `http://localhost:3000`
  - `http://localhost:3000/dashboard`
  - `http://localhost:3000/superadmin`

  Si vous avez un site en ligne (ex. Vercel), ajoutez aussi :

  - `https://votre-domaine.com`
  - `https://votre-domaine.com/dashboard`
  - `https://votre-domaine.com/superadmin`

  (Remplacez `votre-domaine.com` par votre vraie URL.)

- Enregistrez (bouton **Save**).

**Résumé étape 3 :** après la connexion Google, l’utilisateur est renvoyé vers une page de votre app (ex. `/dashboard`). Supabase vérifie : « cette URL est-elle dans ma liste ? » Si oui, la redirection est acceptée. Si non, elle est refusée. D’où l’importance d’ajouter toutes les URLs où vous voulez que l’utilisateur atterrisse (accueil, dashboard, superadmin, etc.).

---

## En une phrase

- **Étape 1 (Google) :** vous créez Client ID + Secret et vous indiquez à Google l’URL de callback Supabase (pour que Google renvoie bien vers Supabase).
- **Étape 3 (Supabase) :** vous indiquez à Supabase les URLs de votre site vers lesquelles il peut renvoyer l’utilisateur après connexion (pour que Supabase accepte la redirection).

Si vous voulez plus de détails avec les noms exacts des menus en anglais, voir **GOOGLE-AUTH-SETUP.md**.
