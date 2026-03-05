# Emails de validation et de rejet – Africadata

Lorsqu’un administrateur **valide** ou **rejette** une publication, l’auteur reçoit un email automatique.

---

## 1. Mise en ligne (statut « published »)

- **Edge Function :** `send-validation-email`
- **Déclenchement :** après `updatePublicationStatus(id, 'published')` (AdminPublications et SuperAdmin).
- **Objet :** Votre publication est désormais en ligne – Africadata
- **Contenu :** Madame, Monsieur, [nom du profil], titre de la publication, message « désormais officiellement publiée et accessible en ligne », **lien d’accès** (URL de la publication), remerciements, signature L’équipe Africadata.
- **Secret optionnel :** `FRONTEND_URL` ou `SITE_URL` (ex. `https://votresite.com`) pour inclure le lien direct vers la publication dans l’email. Sans ce secret, le lien n’apparaît pas dans l’email (l’auteur voit la notification in-app avec le bouton « Voir la publication »).

**Déploiement :**

```bash
supabase functions new send-validation-email   # si besoin
# Copier le code depuis backend/supabase/functions/send-validation-email/index.ts
supabase functions deploy send-validation-email
```

---

## 2. Rejet (statut « rejected » avec motif)

- **Edge Function :** `send-rejection-email`
- **Déclenchement :** après `updatePublicationStatus(id, 'rejected', comment)` (AdminPublications).
- **Objet :** Décision concernant votre publication – Africadata
- **Contenu :** titre de la publication, motif détaillé (admin_comment), invitation à soumettre une version révisée, signature Le Comité Éditorial – Africadata.

**Déploiement :**

```bash
supabase functions new send-rejection-email   # si besoin
# Copier le code depuis backend/supabase/functions/send-rejection-email/index.ts
supabase functions deploy send-rejection-email
```

---

## 3. Configuration Resend

Les deux fonctions utilisent **Resend** (comme l’email de confirmation de soumission). Dans Supabase : **Project Settings** → **Edge Functions** → **Secrets** :

- `RESEND_API_KEY` : clé API Resend
- `RESEND_FROM_EMAIL` : expéditeur (ex. `Africadata <noreply@votredomaine.com>`)

---

## 4. Résumé

| Événement      | Fonction                        | Objet email                                          |
|----------------|----------------------------------|------------------------------------------------------|
| Mise en ligne  | `send-validation-email`         | Votre publication est désormais en ligne – Africadata |
| Rejet          | `send-rejection-email`          | Décision concernant votre publication – Africadata   |

Les templates exacts sont dans les fichiers `backend/supabase/functions/send-validation-email/index.ts` et `backend/supabase/functions/send-rejection-email/index.ts`.
