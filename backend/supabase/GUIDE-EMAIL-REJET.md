# Email de rejet à l'auteur

Lorsqu'un administrateur rejette une publication avec un motif, l'auteur reçoit un **email** avec l'objet **« Décision concernant votre publication – Africadata »** et le motif détaillé (champ `admin_comment`).

Le code de l'Edge Function et le template exact se trouvent dans le dépôt :

- **Fichier :** `backend/supabase/functions/send-rejection-email/index.ts`
- **Déploiement :** `supabase functions deploy send-rejection-email`

Configuration Resend (clé API et email d'envoi) : voir **GUIDE-EMAIL-VALIDATION-REJET.md** pour le détail commun à tous les emails (validation, rejet, confirmation de soumission).
