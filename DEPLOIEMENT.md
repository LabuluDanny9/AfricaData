# Héberger la plateforme AfricaData

Ce guide explique comment **stocker le code sur GitHub** et **mettre la plateforme en ligne** avec une URL publique.

---

## À retenir

| Outil | Rôle |
|-------|------|
| **GitHub** | Stocke le code (dépôt). Ce n’est **pas** un hébergeur de site web. |
| **Cursor** | Éditeur de code. Vous modifiez le projet dans Cursor, puis vous poussez les changements vers GitHub. Cursor **ne peut pas** héberger un site. |
| **Vercel ou Netlify** | Hébergent le **frontend** (React) gratuitement et donnent une URL en ligne (ex. `africadata.vercel.app`). |

**Backend** : Supabase est déjà dans le cloud. Il suffit d’héberger le **frontend** (dossier `frontend/`).

---

## 1. Mettre le code sur GitHub (depuis Cursor)

Si ce n’est pas déjà fait :

1. Ouvrez un terminal dans Cursor (**Terminal** → **New Terminal**).
2. Placez-vous à la racine du projet et exécutez :

```bash
cd "c:\Users\labul\OneDrive\Documents\AfriqueDATAv2"
git init
git add .
git commit -m "Projet AfricaData : frontend + backend Supabase"
git branch -M main
git remote add origin https://github.com/LabuluDanny9/AfricaData.git
git push -u origin main
```

3. Pour les mises à jour ensuite : `git add .` → `git commit -m "..."` → `git push`.

Voir aussi **GIT-RESOLUTION.md** et **GITHUB-SETUP.md** en cas de problème (identité Git, remote, etc.).

---

## 2. Héberger le site (obtenir une URL en ligne)

Deux options gratuites et simples : **Vercel** ou **Netlify**. Ils se connectent à votre dépôt GitHub et déploient le frontend à chaque `git push`.

### Option A : Vercel (recommandé)

1. Allez sur **[vercel.com](https://vercel.com)** et connectez-vous (ou créez un compte avec GitHub).
2. Cliquez sur **Add New** → **Project**.
3. Importez le dépôt **LabuluDanny9/AfricaData** (autorisez Vercel à accéder à GitHub si demandé).
4. **Configuration du projet** :
   - **Root Directory** : cliquez sur **Edit** et choisissez **`frontend`** (pas la racine du repo).
   - **Framework Preset** : Create React App (détecté automatiquement).
   - **Build Command** : `npm run build` (par défaut).
   - **Output Directory** : `build` (par défaut pour Create React App).
5. **Variables d’environnement** (section **Environment Variables**) — **obligatoires** pour que l’inscription et la connexion fonctionnent :
   - **Name** : `REACT_APP_SUPABASE_URL` → **Value** : l’URL de votre projet Supabase (ex. `https://abcdefgh.supabase.co`, sans slash à la fin).
   - **Name** : `REACT_APP_SUPABASE_ANON_KEY` → **Value** : la clé anonyme (anon key) de Supabase (Supabase Dashboard → Project Settings → API → Project API keys → `anon` public).
   - (Optionnel) **Name** : `REACT_APP_GOOGLE_CLIENT_ID` → **Value** : votre Client ID Google OAuth.
   - Cliquez sur **Save** pour chaque variable, puis **Redeploy** le projet (Deployments → ⋮ sur le dernier déploiement → Redeploy) pour que les variables soient prises en compte.
6. Cliquez sur **Deploy**.
7. Une fois le déploiement terminé, Vercel vous donne une URL (ex. `africadata-xxx.vercel.app`). C’est votre plateforme en ligne.

À chaque push sur `main`, Vercel redéploiera automatiquement.

---

### Option B : Netlify

1. Allez sur **[netlify.com](https://netlify.com)** et connectez-vous (ou créez un compte avec GitHub).
2. **Add new site** → **Import an existing project** → **Deploy with GitHub**.
3. Choisissez le dépôt **AfricaData**.
4. **Paramètres de build** :
   - **Base directory** : `frontend`
   - **Build command** : `npm run build`
   - **Publish directory** : `frontend/build`
5. **Variables d’environnement** ( **Site settings** → **Environment variables** ) :
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - (Optionnel) `REACT_APP_GOOGLE_CLIENT_ID`
6. **Deploy site**.
7. Netlify fournit une URL (ex. `xxx.netlify.app`).

Les prochains push sur la branche connectée déclencheront un nouveau déploiement.

---

## 3. Depuis Cursor : workflow habituel

1. Vous travaillez dans **Cursor** (modifications dans `frontend/`, etc.).
2. Vous commitez et poussez vers **GitHub** :
   ```bash
   git add .
   git commit -m "Description des changements"
   git push
   ```
3. **Vercel** ou **Netlify** détecte le push et redéploie le site. Vous n’avez rien à faire de plus pour « héberger avec Cursor » : Cursor sert à coder, GitHub à stocker, Vercel/Netlify à mettre en ligne.

---

## 4. Supabase (Auth, URLs de redirection)

Après mise en ligne, dans **Supabase Dashboard** :

1. **Authentication** → **URL Configuration**  
   - **Site URL** : mettez l’URL de votre site (ex. `https://africadata-xxx.vercel.app`).
2. **Redirect URLs** (même page) : ajoutez **toutes** les URLs de retour après connexion/inscription :
   - `https://votre-url.vercel.app`
   - `https://votre-url.vercel.app/dashboard`
   - `https://votre-url.vercel.app/connexion`
   - (et votre URL Netlify si vous l’utilisez)
3. **Authentication** → **Providers** (ex. Google)  
   - Vérifiez que le fournisseur est activé et que le **Callback URL** Supabase est bien ajouté dans **Google Cloud Console** → **Authorized redirect URIs**.

Sans ces URLs, l’inscription et la connexion (y compris Google) peuvent échouer ou rediriger vers une page blanche.

---

## 5. Si l’inscription ne marche pas en production

### Message « Inscription non configurée » ou « Configurez Supabase (voir .env.example) »

Cela signifie que les variables Supabase **ne sont pas définies** sur Vercel (ou Netlify). À faire :

1. Ouvrez **[vercel.com](https://vercel.com)** → votre projet AfricaData.
2. Allez dans **Settings** → **Environment Variables**.
3. Ajoutez deux variables (cliquez **Add** pour chacune) :
   - **Key** : `REACT_APP_SUPABASE_URL`  
     **Value** : `https://VOTRE-PROJET.supabase.co` (trouvable dans Supabase → Project Settings → API → Project URL).
   - **Key** : `REACT_APP_SUPABASE_ANON_KEY`  
     **Value** : la clé **anon public** (Supabase → Project Settings → API → Project API keys → `anon` public).
4. **Important** : après avoir sauvegardé, faites un **Redeploy** : onglet **Deployments** → menu ⋮ du dernier déploiement → **Redeploy**. Les variables ne sont prises en compte qu’au moment du build.

---

| Autre problème | Vérification |
|----------------|----------------|
| Redirection blanche ou erreur après inscription | **Supabase** → **Authentication** → **URL Configuration** : **Site URL** = l’URL de votre site (ex. `https://xxx.vercel.app`). **Redirect URLs** = `https://xxx.vercel.app` et `https://xxx.vercel.app/dashboard`. |
| Inscription OK mais redirection vers une page blanche ou erreur | **Supabase** → **Authentication** → **URL Configuration**. **Site URL** = l’URL de votre site (ex. `https://xxx.vercel.app`). **Redirect URLs** doit contenir `https://xxx.vercel.app` et `https://xxx.vercel.app/dashboard`. |
| « Invalid login credentials » juste après l’inscription | Souvent dû à la **confirmation email** activée dans Supabase : le compte est créé mais la connexion automatique échoue. Le site affiche maintenant un message clair et redirige vers la page connexion. L’utilisateur doit confirmer son email (lien dans la boîte mail) puis se connecter. Pour éviter cette étape : Supabase → **Authentication** → **Providers** → **Email** → désactiver **Confirm email**. |
| « Compte créé. Confirmez votre email » puis rien | Normal si la **confirmation email** est activée. L’utilisateur doit cliquer sur le lien dans l’email. Vérifiez que **Site URL** dans Supabase pointe vers votre site en prod (sinon le lien de confirmation peut renvoyer vers localhost). |
| Connexion Google ne marche pas en prod | **Google Cloud Console** → **APIs & Services** → **Credentials** → votre client OAuth. Dans **Authorized JavaScript origins**, ajoutez l’URL de production (ex. `https://xxx.vercel.app`). Dans **Authorized redirect URIs**, gardez exactement l’URL de callback Supabase (voir **Supabase** → **Authentication** → **Providers** → **Google**). Voir aussi **backend/supabase/GOOGLE-AUTH-SETUP.md**. |

---

## Résumé

- **Code** : sur **GitHub** (push depuis Cursor).
- **Site en ligne** : **Vercel** ou **Netlify**, connectés au même dépôt GitHub, en ciblant le dossier **`frontend`** et en ajoutant les variables d’environnement Supabase (et Google si besoin).
- **Cursor** : uniquement pour éditer et pousser vers GitHub ; l’hébergement est assuré par Vercel ou Netlify.
