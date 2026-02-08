# Mettre le projet AfricaData sur GitHub

Ce guide vous permet de créer un dépôt GitHub et d’y pousser votre code à chaque modification.

---

## 1. Installer Git (si nécessaire)

- Téléchargez Git pour Windows : https://git-scm.com/download/win  
- Installez-le en laissant les options par défaut.  
- Redémarrez le terminal (ou Cursor) après l’installation.

Vérifier l’installation :

```bash
git --version
```

---

## 2. Créer le dépôt sur GitHub

1. Allez sur **https://github.com** et connectez-vous (ou créez un compte).
2. Cliquez sur **« + »** (en haut à droite) → **« New repository »**.
3. Remplissez :
   - **Repository name** : `AfriqueDATAv2` (ou un autre nom).
   - **Description** (optionnel) : « Plateforme AfricaData – publications scientifiques ».
   - **Public** ou **Private** selon votre choix.
   - Ne cochez **pas** « Add a README file » (le projet en a déjà un ou vous en ajouterez un).
4. Cliquez sur **« Create repository »**.
5. Sur la page du nouveau dépôt, copiez l’URL du dépôt, par exemple :
   - `https://github.com/VOTRE_USERNAME/AfriqueDATAv2.git`
   - ou en SSH : `git@github.com:VOTRE_USERNAME/AfriqueDATAv2.git`

---

## 3. Initialiser Git et faire le premier envoi (une seule fois)

Ouvrez un terminal dans le dossier du projet (`AfriqueDATAv2`) et exécutez :

```bash
cd "c:\Users\labul\OneDrive\Documents\AfriqueDATAv2"

git init
git add .
git status
git commit -m "Premier commit : projet AfricaData (frontend, backend, migrations)"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/AfriqueDATAv2.git
git push -u origin main
```

Remplacez **VOTRE_USERNAME** et **AfriqueDATAv2** par votre nom d’utilisateur GitHub et le nom du dépôt.

Si GitHub vous demande de vous connecter, utilisez votre compte GitHub (ou un **Personal Access Token** si l’authentification par mot de passe est désactivée).

---

## 4. Mises à jour à chaque modification

Chaque fois que vous modifiez le projet et voulez enregistrer sur GitHub :

```bash
cd "c:\Users\labul\OneDrive\Documents\AfriqueDATAv2"

git add .
git status
git commit -m "Description courte de vos changements"
git push
```

Exemples de messages de commit :

- `git commit -m "Ajout des notifications à chaque nouvelle publication"`
- `git commit -m "Correction du formulaire de soumission"`
- `git commit -m "Mise à jour de la librairie et de l'accueil en temps réel"`

---

## 5. Fichiers ignorés (déjà configurés)

Le fichier **`.gitignore`** à la racine du projet exclut notamment :

- `node_modules/`
- Fichiers `.env` (clés API, secrets)
- Dossiers `build/`, `dist/`
- Fichiers de log et de cache

Ne commitez **jamais** vos clés Supabase (`.env`) sur GitHub. Gardez-les uniquement en local ou dans les variables d’environnement de votre hébergeur.

---

## Résumé des commandes utiles

| Action              | Commande                          |
|---------------------|-----------------------------------|
| Voir le statut      | `git status`                      |
| Ajouter tous les fichiers | `git add .`                 |
| Créer un commit     | `git commit -m "Votre message"`   |
| Envoyer sur GitHub | `git push`                        |
| Récupérer les derniers changements | `git pull`              |

Une fois Git installé et le dépôt créé sur GitHub, suivez l’étape 3 une fois, puis l’étape 4 à chaque mise à jour.
