/* ================================================================
   GALERIE PHOTO — commune à tous les mariages
   ----------------------------------------------------------------
   Le mariage est choisi par ?m=<slug>. La liste des photos vient
   du contenu déchiffré sur l'accueil (champ "photos"), jamais d'un
   fichier en clair. Chaque photo est soit une URL (vignette = grande
   image), soit un objet { thumb, full, alt }.
================================================================ */

(function initGallery() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("m");
  const w = (window.WEDDINGS || []).find(function (x) { return x.slug === slug; });
  const priv = w ? window.WeddingCrypto.recall(w.slug) : null;

  if (!w) { window.location.replace("index.html"); return; }
  if (!priv) { window.location.replace("index.html?m=" + encodeURIComponent(w.slug)); return; }

  const PHOTOS = (priv.photos || []).map(function (p) {
    return typeof p === "string" ? { thumb: p, full: p, alt: "" } : p;
  });

  /* ---------- Remplissage de la page ---------- */

  const both = w.names[0] + " & " + w.names[1];
  const q = "?m=" + encodeURIComponent(w.slug);
  document.title = both + " — Les photos";
  document.querySelector('[data-nav="film"]').href = "mariage.html" + q;
  document.querySelector('[data-nav="photos"]').href = "galerie.html" + q;

  const headerImage = document.getElementById("headerImage");
  if (w.cover) {
    headerImage.src = w.cover;
    headerImage.hidden = false;
  } else {
    headerImage.remove();
  }
  const headerDate = document.getElementById("headerDate");
  headerDate.dateTime = w.date;
  headerDate.textContent = w.dateLabel;
  document.getElementById("footerNames").textContent = both;
  document.getElementById("footerLine").textContent = w.dateLabel + " — merci d'avoir été là.";

  const site = document.getElementById("site");
  site.removeAttribute("aria-hidden");
  site.classList.add("is-visible");

  /* ---------- Grille ---------- */

  const grid = document.getElementById("galleryGrid");

  if (!PHOTOS.length) {
    const empty = document.createElement("p");
    empty.className = "gallery__empty";
    empty.textContent = "Les photos seront ajoutées ici prochainement.";
    grid.appendChild(empty);
    return;
  }

  PHOTOS.forEach(function (photo, index) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "gallery__item";
    item.setAttribute("aria-label", "Agrandir la photo" + (photo.alt ? " — " + photo.alt : ""));
    item.dataset.index = String(index);

    const img = document.createElement("img");
    window.WeddingCrypto.setImgWithFallback(img, photo.thumb);
    img.alt = photo.alt || "";
    img.loading = "lazy";
    img.className = "gallery__thumb";

    item.appendChild(img);
    grid.appendChild(item);
  });

  // Fondu progressif des vignettes à l'apparition dans l'écran.
  const items = grid.querySelectorAll(".gallery__item");
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  items.forEach(function (item, i) {
    item.style.transitionDelay = Math.min(i * 40, 320) + "ms";
    observer.observe(item);
  });

  grid.addEventListener("click", function (event) {
    const item = event.target.closest(".gallery__item");
    if (!item) return;
    openLightbox(Number(item.dataset.index));
  });

  /* ---------- Lightbox ---------- */

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCounter = document.getElementById("lightboxCounter");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add("is-open");
    lightbox.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function updateLightbox() {
    const photo = PHOTOS[currentIndex];
    window.WeddingCrypto.setImgWithFallback(lightboxImage, photo.full);
    lightboxImage.alt = photo.alt || "";
    lightboxCounter.textContent = currentIndex + 1 + " / " + PHOTOS.length;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + PHOTOS.length) % PHOTOS.length;
    updateLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % PHOTOS.length;
    updateLightbox();
  }

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", showPrev);
  nextBtn.addEventListener("click", showNext);

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (event) {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPrev();
    if (event.key === "ArrowRight") showNext();
  });
})();
