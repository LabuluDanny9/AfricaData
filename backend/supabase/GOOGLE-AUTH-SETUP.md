# Activer la connexion Google (OAuth Supabase)

La plateforme utilise **Supabase Auth** avec le fournisseur **Google**. Les identifiants Google sont configurés dans **Supabase**, pas dans le fichier `.env` du frontend.

---

## 1. Google Cloud Console — Créer les identifiants OAuth

**Objectif :** obtenir un **Client ID** et un **Client Secret** que vous collerez plus tard dans Supabase pour que « Se connecter avec Google » fonctionne.

### 1.1 Ouvrir Google Cloud et choisir un projet

1. Ouvrez votre navigateur et allez sur : **https://console.cloud.google.com/**
2. Connectez-vous avec votre compte Google.
3. En haut de la page, cliquez sur le nom du projet (à côté de « Google Cloud »).
   - Si vous n'avez pas encore de projet : cliquez sur **Nouveau projet**, donnez un nom (ex. AfricaData), puis **Créer**.
   - Si vous avez déjà un projet : sélectionnez-le dans la liste.

### 1.2 Configurer l'écran de consentement OAuth (une seule fois par projet)

4. Dans le menu de gauche (☰), allez dans : **APIs et services** → **Écran de consentement OAuth** (OAuth consent screen).
5. Choisissez le type d'utilisateur : **Externe** (External) — pour que n'importe quel compte Google puisse se connecter.
6. Cliquez sur **Créer** (Create).
7. Remplissez au minimum :
   - Type : **External** (ou Internal si G Suite).
   - Renseignez **App name** (ex. AfricaData), **User support email**, **Developer contact**.
   - **Authorized domains** : ajoutez **`supabase.co`** (pour que Google autorise le callback Supabase).
   - Enregistrez.

4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
5. Type d’application : **Web application**.
6. **Name** : ex. AfricaData Web.
7. **Authorized JavaScript origins** — ajoutez :
   - `http://localhost:3000` (développement local)
   - L’URL de votre site en production (ex. `https://votre-app.vercel.app`)
8. **Authorized redirect URIs** — vous devez y mettre **exactement** l’URL de callback Supabase :
   - Ouvrez votre projet Supabase → **Authentication** → **Providers** → **Google**.
   - Copiez l’URL affichée sous **Callback URL** (du type `https://XXXXX.supabase.co/auth/v1/callback`).
   - Collez-la dans **Authorized redirect URIs** dans Google Cloud.
9. Cliquez sur **Create** et notez le **Client ID** et le **Client Secret**.

---

## 2. Supabase Dashboard — Activer le fournisseur Google

1. Ouvrez votre projet sur **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. **Authentication** (menu gauche) → **Providers**.
3. Trouvez **Google** et activez-le (**Enable**).
4. Collez le **Client ID** et le **Client Secret** obtenus depuis Google Cloud.
5. Enregistrez (**Save**).

---

## 3. Supabase — URLs de redirection (où renvoyer l’utilisateur après connexion Google)

**Objectif :** dire à Supabase vers quelles adresses de votre site il a le droit d’envoyer l’utilisateur après qu’il s’est connecté avec Google. Sans ça, Supabase bloque la redirection et vous pouvez avoir une erreur ou une page blanche.

### 3.1 Où faire la configuration

- Allez sur **https://supabase.com/dashboard** et ouvrez votre projet.
- Dans le menu de gauche : **Authentication** → **URL Configuration** (souvent en bas de la liste sous « Authentication »).

### 3.2 Site URL

- **Site URL** : c’est la page d’accueil de votre application.
  - En développement sur votre PC : mettez **`http://localhost:3000`**
  - En production (site en ligne) : mettez l’URL de votre site, ex. **`https://votre-app.vercel.app`**

### 3.3 Redirect URLs (liste des URLs autorisées)

- **Redirect URLs** : c’est une liste d’URLs. Supabase ne peut renvoyer l’utilisateur **que** vers des URLs présentes dans cette liste.
- Cliquez sur **« Add URL »** (ou le champ prévu) et ajoutez **une URL par ligne**, par exemple :

  **Pour le développement en local :**
  - `http://localhost:3000`
  - `http://localhost:3000/dashboard`
  - `http://localhost:3000/superadmin`

  **Si vous avez un site en production**, ajoutez aussi :
  - `https://votre-domaine.com`
  - `https://votre-domaine.com/dashboard`
  - `https://votre-domaine.com/superadmin`

  (Remplacez `votre-domaine.com` par votre vraie URL, ex. `africadata.vercel.app`.)

- Enregistrez (bouton **Save** ou équivalent).

**En résumé :** après la connexion Google, l’utilisateur est renvoyé vers une page de votre app (ex. `/dashboard`). Supabase vérifie que cette URL est dans la liste « Redirect URLs ». Si elle n’y est pas, la redirection est refusée.

---

## 4. Vérification

1. Lancez le frontend (`npm start` dans `frontend/`).
2. Allez sur **Connexion** ou **Inscription**.
3. Cliquez sur **Se connecter avec Google** ou **S'inscrire avec Google**.
4. Vous êtes redirigé vers Google → après connexion, Supabase vous renvoie sur votre app (ex. `/dashboard`) avec une session valide.

---

## Dépannage

- **« Connexion Google impossible »** : vérifiez que le fournisseur Google est activé dans Supabase et que Client ID / Secret sont corrects.
- **« redirect_uri_mismatch »** : l’URL de callback dans Google Cloud doit être **exactement** celle affichée dans Supabase (Providers → Google → Callback URL).
- **Redirection vers une page blanche ou erreur** : vérifiez que l’URL de retour (ex. `https://votre-app.vercel.app/dashboard`) est bien dans **Redirect URLs** (Supabase → URL Configuration).

---

## Résumé

| Où | Quoi |
|----|------|
| **Google Cloud** | Créer OAuth Client ID (Web), Callback URL = Supabase callback, Origins = votre site + localhost |
| **Supabase → Providers → Google** | Activer Google, coller Client ID et Client Secret |
| **Supabase → URL Configuration** | Site URL + Redirect URLs = votre site et `/dashboard` (et localhost en dev) |

Aucune variable `REACT_APP_GOOGLE_CLIENT_ID` n’est nécessaire dans le frontend : tout passe par Supabase.
