# Corentin Ananas — Films de mariage

Site statique (HTML / CSS / JS vanilla) pour GitHub Pages.
L'accueil liste les mariages en cards ; chaque couple clique sur le sien,
saisit son mot de passe et accède à son film.

## Structure

```
index.html            ← accueil : cards des mariages + fenêtre mot de passe
mariage.html          ← page film commune (mariage.html?m=<slug>)
css/style.css
js/weddings.js        ← liste PUBLIQUE des mariages (prénoms, date, photo)
js/vault.js           ← contenu PRIVÉ chiffré (liens vidéo / téléchargement)
js/crypto.js          ← chiffrement / déchiffrement
js/portal.js          ← logique de l'accueil
js/mariage.js         ← logique de la page film + lecteur
tools/chiffrer.html   ← outil pour générer un bloc chiffré
assets/images/
```

## Comment fonctionne la protection

Aucun mot de passe n'est écrit dans le code. Pour chaque mariage, les liens
vidéo et téléchargement sont **chiffrés** (AES-GCM 256) avec une clé dérivée
du mot de passe (PBKDF2-SHA256, 600 000 itérations). Le navigateur du
visiteur tente de déchiffrer avec ce qu'il a tapé : si c'est faux, le bloc
reste illisible. Lire le code source ou le dépôt GitHub ne donne donc ni le
mot de passe ni les liens du film.

Limites à connaître (site statique, sans serveur) :

- **Choisir des mots de passe non devinables.** Une date de mariage (8 chiffres) se
  retrouve par essais successifs en peu de temps, même chiffrée. Préférer
  3–4 mots ou une suite d'au moins 10 caractères variés.
- Les prénoms, dates et photos de couverture restent publics (ils
  s'affichent sur l'accueil).
- Si le fichier vidéo sur R2 est en accès public, quelqu'un qui obtient
  l'URL (ex. un invité qui la partage) peut le lire sans mot de passe. Pour
  verrouiller aussi le fichier, il faudra un Cloudflare Worker qui délivre
  des liens temporaires.

## Ajouter un mariage

1. Ajouter une entrée dans `js/weddings.js` (slug unique, sans accent ni
   espace, ex. `lena-romain`).
2. Mettre la photo de couverture dans `assets/images/` et renseigner
   `cover` (ou laisser `null` : un monogramme s'affiche à la place).
3. Ouvrir `tools/chiffrer.html` **en local** (double-clic), saisir le slug,
   le mot de passe et les URLs du film → copier le bloc généré.
4. Coller ce bloc dans `js/vault.js`.

## Changer un mot de passe ou ajouter le lien du film

Régénérer le bloc du mariage avec `tools/chiffrer.html` (nouveau mot de
passe et/ou URLs) et remplacer l'ancien bloc dans `js/vault.js`.
Tant qu'une URL est vide, la page affiche un état « aperçu » propre.

## Prévisualiser en local

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.
