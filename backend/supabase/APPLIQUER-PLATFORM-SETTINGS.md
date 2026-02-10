# Créer la table platform_settings (bouton Activer/Désactiver le paiement)

Si le bouton **Activer / Désactiver le paiement** dans Paramètres ne persiste pas (ou affiche une erreur), la table `platform_settings` n'existe pas encore en base.

## Exécuter la migration

1. Ouvrez **Supabase Dashboard** → votre projet → **SQL Editor**.
2. Copiez-collez le contenu du fichier **migrations/20250207_platform_settings.sql**.
3. Cliquez sur **Run**.

Après exécution, le réglage paiement sera enregistré en base et partagé pour tous les utilisateurs. Sans cette table, le réglage est sauvegardé localement (localStorage) par navigateur.
