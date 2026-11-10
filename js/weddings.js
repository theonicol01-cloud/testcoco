/* ================================================================
   LISTE DES MARIAGES (informations PUBLIQUES uniquement)
   ----------------------------------------------------------------
   Ce fichier ne contient que ce qui s'affiche sur les cards de
   l'accueil : prénoms, date, photo de couverture.
   AUCUN lien vidéo, AUCUN mot de passe ici : le contenu privé de
   chaque mariage est chiffré dans js/vault.js.

   Ajouter un mariage :
   1. Ajouter une entrée ci-dessous (slug unique, sans accent ni espace)
   2. Générer son bloc chiffré avec tools/chiffrer.html
   3. Coller ce bloc dans js/vault.js
================================================================ */

window.WEDDINGS = [
  {
    slug: "marine-clement",
    names: ["Marine", "Clément"],
    date: "2026-05-09",
    dateLabel: "09 mai 2026",
    cover: "assets/images/maries.jpg",
    titleImage: "assets/images/titre-mariage.png" /* optionnel : titre en image à la place des prénoms */
  },
  {
    slug: "lena-romain",
    names: ["Lena", "Romain"],
    date: "2026-05-16",
    dateLabel: "16 mai 2026",
    cover: "assets/images/lena-romain.jpg" /* visuel provisoire — remplacer le fichier par une vraie photo (même nom) */
  }
];
