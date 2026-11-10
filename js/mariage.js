/* ================================================================
   PAGE FILM — commune à tous les mariages
   ----------------------------------------------------------------
   Le mariage est choisi par ?m=<slug>. Les liens vidéo /
   téléchargement viennent du contenu déchiffré sur l'accueil
   (mot de passe), jamais d'un fichier en clair.
================================================================ */

const params = new URLSearchParams(window.location.search);
const SLUG = params.get("m");
const WEDDING = (window.WEDDINGS || []).find(function (w) { return w.slug === SLUG; });
const PRIVATE = WEDDING ? window.WeddingCrypto.recall(WEDDING.slug) : null;

// Mariage inconnu ou pas encore déverrouillé : retour à l'accueil
// (qui ouvre directement la fenêtre mot de passe du bon mariage).
if (!WEDDING) {
  window.location.replace("index.html");
} else if (!PRIVATE) {
  window.location.replace("index.html?m=" + encodeURIComponent(WEDDING.slug));
}

const VIDEO_URL = (PRIVATE && PRIVATE.videoUrl) || "";
const DOWNLOAD_URL = (PRIVATE && PRIVATE.downloadUrl) || "";

/* ================================================================
   REMPLISSAGE DE LA PAGE
================================================================ */

(function fillPage() {
  if (!WEDDING || !PRIVATE) return;

  const w = WEDDING;
  const both = w.names[0] + " & " + w.names[1];

  document.title = both + " — Le film du mariage";
  document.getElementById("heroName1").textContent = w.names[0];
  document.getElementById("heroName2").textContent = w.names[1];

  if (w.titleImage) {
    const title = document.querySelector(".hero__title");
    title.classList.add("hero__title--img");
    title.innerHTML = "";
    const img = document.createElement("img");
    img.src = w.titleImage;
    img.alt = both;
    img.className = "hero__title-img";
    title.appendChild(img);
  }

  const q = "?m=" + encodeURIComponent(w.slug);
  document.querySelector('[data-nav="film"]').href = "mariage.html" + q;
  document.querySelector('[data-nav="photos"]').href = "galerie.html" + q;

  const heroDate = document.getElementById("heroDate");
  heroDate.dateTime = w.date;
  heroDate.textContent = w.dateLabel;

  const heroImage = document.getElementById("heroImage");
  if (w.cover) {
    heroImage.src = w.cover;
    heroImage.alt = w.names[0] + " et " + w.names[1] + " le jour de leur mariage";
    heroImage.hidden = false;
    document.getElementById("video").poster = w.cover;
  } else {
    heroImage.remove();
    document.getElementById("heroMedia").classList.add("hero__media--plain");
  }

  document.getElementById("footerNames").textContent = both;
  document.getElementById("footerLine").textContent = w.dateLabel + " — merci d'avoir été là.";

  const site = document.getElementById("site");
  site.removeAttribute("aria-hidden");
  site.classList.add("is-visible");
})();

/* ================================================================
   DÉFILEMENT VERS LE FILM
================================================================ */

(function initScrollCue() {
  const cue = document.getElementById("scrollCue");
  const film = document.getElementById("film");
  if (!cue || !film) return;

  cue.addEventListener("click", function () {
    film.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();

/* ================================================================
   LECTEUR VIDÉO PERSONNALISÉ
================================================================ */

(function initPlayer() {
  const player = document.getElementById("player");
  const video = document.getElementById("video");
  const emptyState = document.getElementById("playerEmpty");
  const giantPlay = document.getElementById("giantPlay");
  const playBtn = document.getElementById("playBtn");
  const iconPlay = playBtn.querySelector(".icon-play");
  const iconPause = playBtn.querySelector(".icon-pause");
  const muteBtn = document.getElementById("muteBtn");
  const iconVolOn = muteBtn.querySelector(".icon-vol-on");
  const iconVolOff = muteBtn.querySelector(".icon-vol-off");
  const volumeSlider = document.getElementById("volumeSlider");
  const progress = document.getElementById("progress");
  const progressFill = document.getElementById("progressFill");
  const progressHandle = document.getElementById("progressHandle");
  const timeCurrent = document.getElementById("timeCurrent");
  const timeDuration = document.getElementById("timeDuration");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  const hasVideo = Boolean(VIDEO_URL);

  if (hasVideo) {
    // Si le fichier ne se charge pas, on réessaie avec l'autre forme
    // de l'URL (accents codés différemment selon l'ordinateur d'origine).
    let triedAlt = false;
    video.addEventListener("error", function () {
      const alt = window.WeddingCrypto.altUrl(VIDEO_URL);
      if (!triedAlt && alt) {
        triedAlt = true;
        video.src = alt;
        video.load();
      }
    });
    video.addEventListener("loadedmetadata", function () {
      const btn = document.getElementById("downloadBtn");
      if (DOWNLOAD_URL === VIDEO_URL) btn.href = video.currentSrc;
    });
    video.src = VIDEO_URL;
    emptyState.hidden = true;
  } else {
    // Pas encore de vidéo réelle : on affiche l'état vide et on
    // désactive la lecture, sans casser l'aperçu de l'interface.
    emptyState.hidden = false;
  }

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  function togglePlay() {
    if (!hasVideo) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  giantPlay.addEventListener("click", togglePlay);
  playBtn.addEventListener("click", togglePlay);

  video.addEventListener("play", function () {
    player.dataset.state = "playing";
    iconPlay.hidden = true;
    iconPause.hidden = false;
  });

  video.addEventListener("pause", function () {
    player.dataset.state = "paused";
    iconPlay.hidden = false;
    iconPause.hidden = true;
  });

  video.addEventListener("loadedmetadata", function () {
    timeDuration.textContent = formatTime(video.duration);
  });

  video.addEventListener("timeupdate", function () {
    const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    progressFill.style.width = pct + "%";
    progressHandle.style.left = pct + "%";
    progress.setAttribute("aria-valuenow", Math.round(pct));
    timeCurrent.textContent = formatTime(video.currentTime);
  });

  function seekFromEvent(clientX) {
    if (!hasVideo || !video.duration) return;
    const rect = progress.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
  }

  let isScrubbing = false;

  progress.addEventListener("pointerdown", function (e) {
    isScrubbing = true;
    seekFromEvent(e.clientX);
  });

  window.addEventListener("pointermove", function (e) {
    if (isScrubbing) seekFromEvent(e.clientX);
  });

  window.addEventListener("pointerup", function () {
    isScrubbing = false;
  });

  progress.addEventListener("keydown", function (e) {
    if (!hasVideo || !video.duration) return;
    const step = video.duration * 0.02;
    if (e.key === "ArrowRight") video.currentTime = Math.min(video.duration, video.currentTime + step);
    if (e.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - step);
  });

  volumeSlider.addEventListener("input", function () {
    const value = Number(volumeSlider.value) / 100;
    video.volume = value;
    video.muted = value === 0;
    updateVolumeIcon();
  });

  function updateVolumeIcon() {
    const muted = video.muted || video.volume === 0;
    iconVolOn.hidden = muted;
    iconVolOff.hidden = !muted;
  }

  muteBtn.addEventListener("click", function () {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) {
      video.volume = 1;
      volumeSlider.value = 100;
    }
    updateVolumeIcon();
  });

  fullscreenBtn.addEventListener("click", function () {
    const frame = player.querySelector(".player__frame");
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (frame.requestFullscreen) {
      frame.requestFullscreen();
    }
  });
})();

/* ================================================================
   TÉLÉCHARGEMENT
================================================================ */

(function initDownload() {
  const btn = document.getElementById("downloadBtn");
  const note = document.getElementById("downloadNote");

  if (DOWNLOAD_URL) {
    btn.href = DOWNLOAD_URL;
    btn.setAttribute("download", "");
    note.textContent = "Le film est disponible en qualité originale.";
  } else {
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      note.textContent = "Le lien de téléchargement n'est pas encore actif.";
      note.style.color = "var(--gold)";
    });
  }
})();
