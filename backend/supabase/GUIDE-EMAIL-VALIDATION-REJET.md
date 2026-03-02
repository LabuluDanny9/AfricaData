# Emails de validation et de rejet – Africadata

Lorsqu’un administrateur **valide** ou **rejette** une publication, l’auteur reçoit un email automatique.

---

## 1. Validation (statut « published »)

- **Edge Function :** `send-validation-email`
- **Déclenchement :** après `updatePublicationStatus(id, 'published')` (AdminPublications et SuperAdmin).
- **Objet :** Validation de votre publication – Africadata
- **Contenu :** avis favorable, critères respectés, mise en ligne à venir, remerciements, signature Le Comité Éditorial – Africadata.

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

| Événement   | Fonction                        | Objet email                                      |
|------------|----------------------------------|--------------------------------------------------|
| Validation | `send-validation-email`         | Validation de votre publication – Africadata     |
| Rejet      | `send-rejection-email`          | Décision concernant votre publication – Africadata |

Les templates exacts sont dans les fichiers `backend/supabase/functions/send-validation-email/index.ts` et `backend/supabase/functions/send-rejection-email/index.ts`.
