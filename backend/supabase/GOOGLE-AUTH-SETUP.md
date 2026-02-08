# Activer la connexion Google (OAuth Supabase)

La plateforme utilise **Supabase Auth** avec le fournisseur **Google**. Les identifiants Google sont configurés dans **Supabase**, pas dans le fichier `.env` du frontend.

---

## 1. Google Cloud Console — Créer les identifiants OAuth

1. Allez sur **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Créez un projet ou sélectionnez un projet existant.
3. **APIs & Services** → **OAuth consent screen** :
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

## 3. Supabase — URLs de redirection

1. **Authentication** → **URL Configuration**.
2. **Site URL** : mettez l’URL principale de votre app (ex. `https://votre-app.vercel.app` ou `http://localhost:3000` en dev).
3. **Redirect URLs** — ajoutez toutes les URLs vers lesquelles Supabase peut rediriger après connexion :
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000`
   - En production : `https://votre-app.vercel.app/dashboard`, `https://votre-app.vercel.app`, etc.

Sans ces URLs, Supabase refusera la redirection après connexion Google.

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
