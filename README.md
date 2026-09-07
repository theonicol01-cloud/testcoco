# Marine & Clément — Site du film de mariage

Prototype front-end (HTML / CSS / JS vanilla), prêt pour GitHub Pages.
Aucune intégration Cloudflare pour l'instant — tout fonctionne en local.

## Structure

```
index.html
css/style.css
js/script.js
assets/images/maries.jpg   ← votre photo, déjà en place
```

## Prévisualiser en local

Pas de build, pas de dépendances. Deux options :

**Option simple** — double-cliquez sur `index.html`. Il s'ouvre dans votre
navigateur et tout fonctionne (photo, mot de passe, lecteur).

**Option recommandée** — lancez un petit serveur local (évite certaines
limitations de sécurité des navigateurs avec les fichiers locaux, utile
plus tard pour tester la vidéo) :

```bash
cd wedding-site
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

## Mot de passe de démonstration

Le prototype est protégé par un mot de passe **côté front uniquement**,
juste pour visualiser le parcours complet (page → mot de passe → film).

Mot de passe actuel : **09052026**

⚠️ Ce n'est pas une vraie protection : le mot de passe est visible dans
`js/script.js`. La vraie sécurité viendra du Cloudflare Worker, comme
prévu dans le cahier des charges.

## Ce qui est prêt à remplacer

Tout est centralisé en haut de `js/script.js` :

```js
const VIDEO_URL = "";     // URL Cloudflare R2 du film (streaming)
const DOWNLOAD_URL = "";  // URL Cloudflare R2 du film (téléchargement)
```

Tant que ces deux valeurs sont vides, le site affiche un état "aperçu"
propre (visuel du lecteur visible, message "le film sera ajouté ici",
bouton de téléchargement visible mais qui prévient que le lien n'est
pas encore actif) — rien n'est cassé, tout est démontrable tel quel.

## Remplacer la photo

Le fond du hero et l'image du mot de passe utilisent la même image :

```
assets/images/maries.jpg
```

Remplacez simplement ce fichier par une autre photo (même nom) pour la
changer partout sur le site.

## Publier sur GitHub Pages

1. Créez un dépôt GitHub (idéalement **privé**, puisque le site est
   réservé aux invités).
2. Poussez le contenu de ce dossier à la racine du dépôt :
   ```bash
   git init
   git add .
   git commit -m "Site mariage Marine & Clément"
   git branch -M main
   git remote add origin <url-de-votre-dépôt>
   git push -u origin main
   ```
3. Dans les réglages du dépôt : **Settings → Pages → Source →
   Deploy from a branch → `main` / `root`**.
4. Le site sera disponible à une adresse du type
   `https://votre-compte.github.io/nom-du-depot/`.

Note : un dépôt GitHub Pages **gratuit** est public par défaut même si
le contenu n'est pas indexé — n'importe qui connaissant l'URL exacte
pourra la visiter (le mot de passe front-end filtre l'accès au contenu,
mais pas la visibilité de l'URL elle-même). C'est exactement pour cette
raison que l'étape suivante (Cloudflare Worker) est prévue pour la
vraie protection.

## Prochaine étape (non commencée)

- Upload du film (~3 Go, MP4 H.264) sur Cloudflare R2
- Cloudflare Worker pour l'authentification réelle et des URLs
  temporaires sécurisées
- Branchement de `VIDEO_URL` et `DOWNLOAD_URL` sur les URLs R2/Worker
