# Résolution des erreurs Git (identité, remote, push)

Exécutez ces commandes **dans l’ordre** dans un terminal, à la racine du projet.

---

## Étape 1 : Définir votre identité Git (obligatoire)

Remplacez par **votre nom** et **votre email** (idéalement l’email de votre compte GitHub) :

```bash
git config --global user.name "Labulu Danny"
git config --global user.email "votre-email@example.com"
```

Exemple avec un email GitHub (si vous avez activé la confidentialité des emails, utilisez l’adresse fournie par GitHub) :

```bash
git config --global user.email "labuludanny9@users.noreply.github.com"
```

Vérifier la config :

```bash
git config --global --list
```

---

## Étape 2 : Aller dans le projet et corriger le remote

Votre dépôt GitHub est : **https://github.com/LabuluDanny9/AfricaData.git**

```bash
cd "c:\Users\labul\OneDrive\Documents\AfriqueDATAv2"
```

Si vous avez déjà ajouté `origin` avec une mauvaise URL, mettez à jour :

```bash
git remote set-url origin https://github.com/LabuluDanny9/AfricaData.git
```

Si vous n’aviez jamais ajouté `origin`, utilisez :

```bash
git remote add origin https://github.com/LabuluDanny9/AfricaData.git
```

Vérifier le remote :

```bash
git remote -v
```

---

## Étape 3 : Faire un commit (obligatoire avant le premier push)

L’erreur **« src refspec main does not match any »** signifie souvent qu’il n’y a **aucun commit**. Il faut d’abord committer :

```bash
git add .
git status
git commit -m "Premier commit : projet AfricaData (frontend, backend, migrations)"
git branch -M main
```

---

## Étape 4 : Pousser vers GitHub

```bash
git push -u origin main
```

Si GitHub demande une authentification :
- **Nom d’utilisateur** : votre identifiant GitHub (ex. `LabuluDanny9`)
- **Mot de passe** : utilisez un **Personal Access Token** (GitHub n’accepte plus le mot de passe du compte).  
  Créer un token : GitHub → Settings → Developer settings → Personal access tokens → Generate new token (avec au moins la permission `repo`).

---

## Récapitulatif (copier-coller en une fois)

Après avoir remplacé l’email ci-dessous :

```bash
git config --global user.name "Labulu Danny"
git config --global user.email "VOTRE_EMAIL_ICI"

cd "c:\Users\labul\OneDrive\Documents\AfriqueDATAv2"
git remote set-url origin https://github.com/LabuluDanny9/AfricaData.git
git add .
git commit -m "Premier commit : projet AfricaData"
git branch -M main
git push -u origin main
```

Une fois que ça fonctionne, pour les prochaines mises à jour :

```bash
cd "c:\Users\labul\OneDrive\Documents\AfriqueDATAv2"
git add .
git commit -m "Description de vos changements"
git push
```
