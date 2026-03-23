# Mettre le code à jour sur GitHub

À la racine du projet (dossier `AfriqueDATAv2`), dans un terminal :

```bash
# 1. Voir les fichiers modifiés
git status

# 2. Ajouter tous les changements
git add .

# 3. Créer un commit avec un message
git commit -m "Mise à jour : Edge Functions, workflow GitHub Actions, guides"

# 4. Envoyer sur GitHub (branche main)
git push origin main
```

**En une seule ligne (PowerShell) :**

```powershell
cd "c:\Users\labul\OneDrive\Documents\AfriqueDATAv2"; git add .; git commit -m "Mise à jour : Edge Functions, workflow GitHub Actions, guides"; git push origin main
```

---

## Si un message demande de configurer `user.name` et `user.email`

```bash
git config --global user.email "votre@email.com"
git config --global user.name "Votre Nom"
```

Puis refaire `git commit` et `git push`.

---

## Si `git push` demande un identifiant

- Utilisez votre **compte GitHub** et un **Personal Access Token** (mot de passe) au lieu du mot de passe du compte.
- Création d’un token : GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Generate new token**.
