# Déployer les Edge Functions (emails Africadata)

Ce guide explique comment déployer les trois Edge Functions utilisées pour les emails : **confirmation de soumission**, **validation** et **rejet**.

**Structure déjà en place** : à la racine du projet vous avez maintenant :
- `supabase/config.toml` — configuration minimale pour le déploiement
- `supabase/functions/send-submission-confirmation-email/index.ts`
- `supabase/functions/send-validation-email/index.ts`
- `supabase/functions/send-rejection-email/index.ts`

---

## À faire maintenant (3 étapes)

### 1. Installer le CLI Supabase

À la racine du projet :
```bash
npm install
```
(Le `package.json` contient déjà `supabase` en devDependency.)

### 2. Se connecter et lier le projet Supabase

Dans un terminal, à la racine du projet (`AfriqueDATAv2`) :
```bash
npx supabase login
npx supabase link --project-ref VOTRE_PROJECT_REF
```
`VOTRE_PROJECT_REF` : identifiant du projet dans l’URL du dashboard (ex. `https://app.supabase.com/project/abcdefgh` → ref = `abcdefgh`).

### 3. Déployer les trois fonctions

Toujours à la racine du projet :
```bash
npx supabase functions deploy send-submission-confirmation-email
npx supabase functions deploy send-validation-email
npx supabase functions deploy send-rejection-email
```

Ensuite, configurer les **secrets Resend** dans le dashboard Supabase (voir section ci-dessous).

---

## Configurer les secrets (Resend)

Les fonctions envoient les emails via **Resend**. Il faut définir les secrets dans Supabase :

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard) → votre projet.
2. **Project Settings** (icône engrenage) → **Edge Functions**.
3. Section **Secrets** : ajoutez :
   - `RESEND_API_KEY` : votre clé API Resend (créée sur [resend.com](https://resend.com)).
   - `RESEND_FROM_EMAIL` : l’adresse d’envoi (ex. `Africadata <noreply@votredomaine.com>`). Pour tester sans domaine vérifié, vous pouvez utiliser `onboarding@resend.dev`.

Sans ces secrets, les fonctions renverront une erreur du type « RESEND_API_KEY non configurée ».

---

## Vérifier le déploiement

- Dans le Dashboard Supabase : **Edge Functions** : vous devez voir les trois fonctions listées.
- Après une **soumission**, une **validation** ou un **rejet** depuis l’app, l’auteur reçoit l’email correspondant (si l’email du profil est renseigné et Resend est configuré).

---

## Résumé des commandes

À la racine du projet, après `npm install` et `npx supabase link` :

```bash
npx supabase functions deploy send-submission-confirmation-email
npx supabase functions deploy send-validation-email
npx supabase functions deploy send-rejection-email
```

Pour **mettre à jour** une fonction : modifiez le fichier dans `supabase/functions/NOM/` puis relancez `npx supabase functions deploy NOM`.

---

## Option : déploiement via GitHub Actions

Si le CLI Supabase est bloqué sur votre poste (ex. Device Guard sous Windows), vous pouvez déployer les Edge Functions depuis **GitHub Actions**.

### Prérequis

1. Le dépôt est sur **GitHub** et le workflow est présent :
   - `.github/workflows/deploy-edge-functions.yml`

2. **Créer un token d’accès Supabase**  
   - Allez sur [Supabase Dashboard](https://supabase.com/dashboard) → **Account** (icône utilisateur en bas à gauche) → **Access Tokens**.  
   - Créez un token (ex. « GitHub Actions ») et copiez-le.

3. **Ajouter les secrets dans GitHub**  
   - Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.  
   - Créez deux secrets :
     - **`SUPABASE_ACCESS_TOKEN`** : le token copié à l’étape précédente.
     - **`SUPABASE_PROJECT_REF`** : l’identifiant du projet (dans l’URL du projet : `https://app.supabase.com/project/XXXXX` → `XXXXX`).

### Déploiement

- **Automatique** : à chaque **push sur `main`** qui modifie un fichier dans `supabase/functions/` ou le workflow lui-même, les trois fonctions sont déployées.
- **Manuel** : onglet **Actions** du dépôt → workflow **Deploy Edge Functions** → **Run workflow** → **Run workflow**.

Une fois le workflow vert, les Edge Functions sont déployées sur votre projet Supabase. Configurez ensuite les secrets **Resend** dans Supabase (Project Settings → Edge Functions → Secrets) comme indiqué ci-dessus.
