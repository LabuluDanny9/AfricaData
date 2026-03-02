# Envoi d'email de confirmation après soumission d'une publication

Lorsqu'un utilisateur soumet une publication sur Africadata, il reçoit un **message de succès à l'écran** lui indiquant de consulter son adresse email. Un **email de confirmation** est envoyé automatiquement à l'auteur avec le texte suivant :

- **Objet :** Confirmation de réception et d'examen de votre publication – Africadata
- **Contenu :** accusé de réception, information sur l'examen scientifique et éditorial, délai d'analyse (jusqu'à 24 h), confirmation des frais enregistrés, et suite (validation → mise en ligne ; non-validation → message détaillé).

Le frontend appelle l'**Edge Function** Supabase `send-submission-confirmation-email` après chaque soumission réussie.

---

## 1. Créer / déployer l'Edge Function

Si la fonction n'existe pas encore, à la racine du projet Supabase (où vous exécutez `supabase`) :

```bash
supabase functions new send-submission-confirmation-email
```

Puis copiez le contenu de `backend/supabase/functions/send-submission-confirmation-email/index.ts` dans le fichier créé par la CLI (souvent `supabase/functions/send-submission-confirmation-email/index.ts`).

Déployer :

```bash
supabase functions deploy send-submission-confirmation-email
```

---

## 2. Configurer Resend

Comme pour l’email de rejet (voir `GUIDE-EMAIL-REJET.md`), l’envoi utilise **Resend**.

1. Créez un compte sur [Resend](https://resend.com) et récupérez une **API Key**.
2. Dans le Dashboard Supabase : **Project Settings** → **Edge Functions** → **Secrets**.
3. Ajoutez (si pas déjà fait) :
   - `RESEND_API_KEY` : votre clé API Resend
   - `RESEND_FROM_EMAIL` : l’email d’envoi (ex. `Africadata <noreply@votredomaine.com>`). Pour les tests sans domaine vérifié, utilisez `onboarding@resend.dev`.

Les mêmes secrets sont utilisés pour l’email de rejet et l’email de confirmation de soumission.

---

## 3. Comportement

- Après un **Soumettre la publication** réussi, le frontend affiche un toast : *« Votre publication a été soumise avec succès. Consultez votre adresse email pour plus de détails. »*
- Le frontend appelle ensuite `send-submission-confirmation-email` avec l’`id` de la publication. La fonction récupère l’email de l’auteur (table `profiles`), puis envoie l’email via Resend.
- Si l’Edge Function n’est pas déployée ou si Resend n’est pas configuré, l’utilisateur voit quand même le message de succès ; l’email ne part simplement pas.
