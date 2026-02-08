# Corriger l'erreur « Could not find the 'bio' column of 'profiles' »

Cette erreur signifie que la table `profiles` n’a pas encore les colonnes **bio**, **phone**, **location**, etc.

## À faire : exécuter le script SQL dans Supabase

1. Ouvre **Supabase Dashboard** → ton projet.
2. Menu de gauche → **SQL Editor**.
3. Clique sur **+ New query**.
4. **Copie-colle le script ci-dessous** dans l’éditeur.
5. Clique sur **Run** (ou Ctrl+Entrée).

### Script à exécuter

```sql
-- Ajoute les colonnes manquantes à la table profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS institution TEXT,
  ADD COLUMN IF NOT EXISTS domain_interest TEXT;
```

6. Tu dois voir un message du type **Success** ou **Success. No rows returned**.
7. Recharge la page de ton application (F5) : l’erreur ne devrait plus apparaître.
