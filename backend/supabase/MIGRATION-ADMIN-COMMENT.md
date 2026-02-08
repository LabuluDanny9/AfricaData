# Corriger l'erreur « admin_comment column not found »

L'erreur **Could not find the 'admin_comment' column of 'publications' in the schema cache** signifie que la colonne `admin_comment` n'existe pas encore dans la table `publications`.

## Solution : exécuter la migration dans Supabase

1. Ouvrez votre projet sur **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Allez dans **SQL Editor** (menu de gauche).
3. Créez une nouvelle requête et **collez le SQL ci-dessous**.
4. Cliquez sur **Run** (ou Ctrl+Entrée).

```sql
-- Commentaire admin lors du rejet d'une publication (visible par l'auteur dans Mes publications)
ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS admin_comment TEXT;

COMMENT ON COLUMN public.publications.admin_comment IS 'Commentaire de l''administrateur en cas de rejet (visible par l''auteur)';
```

5. Après l’exécution, **rechargez votre application** (F5). Si l’erreur persiste, attendez quelques secondes : le cache du schéma Supabase se met à jour automatiquement.
6. Si besoin, dans Supabase Dashboard : **Settings** → **API** → vérifier que le projet est bien à jour.

Une fois la colonne créée, l’erreur disparaît et les commentaires de rejet s’affichent dans « Mes publications » pour l’auteur.
