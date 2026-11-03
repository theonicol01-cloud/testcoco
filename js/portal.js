/* ================================================================
   ACCUEIL — cards des mariages + mot de passe
================================================================ */

(function initPortal() {
  const weddings = window.WEDDINGS || [];
  const vault = window.VAULT || {};
  const grid = document.getElementById("weddingGrid");

  const gate = document.getElementById("gate");
  const gateNames = document.getElementById("gateNames");
  const gateDate = document.getElementById("gateDate");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gatePassword");
  const submit = document.getElementById("gateSubmit");
  const error = document.getElementById("gateError");
  const closeBtn = document.getElementById("gateClose");
  const backdrop = document.getElementById("gateBackdrop");

  let current = null;
  let lastTrigger = null;

  function filmUrl(slug) {
    return "mariage.html?m=" + encodeURIComponent(slug);
  }

  /* ---------- Cards ---------- */

  weddings.forEach(function (w) {
    const li = document.createElement("li");

    const card = document.createElement("button");
    card.type = "button";
    card.className = "wedding-card";
    card.dataset.slug = w.slug;
    card.setAttribute("aria-label", "Accéder au film de " + w.names.join(" et "));

    const media = document.createElement("div");
    media.className = "wedding-card__media";
    if (w.cover) {
      const img = document.createElement("img");
      img.src = w.cover;
      img.alt = "";
      img.loading = "lazy";
      media.appendChild(img);
    } else {
      media.classList.add("wedding-card__media--monogram");
      const mono = document.createElement("span");
      mono.className = "wedding-card__monogram";
      mono.innerHTML = w.names[0].charAt(0) + "<em>&amp;</em>" + w.names[1].charAt(0);
      media.appendChild(mono);
    }

    const body = document.createElement("div");
    body.className = "wedding-card__body";

    const names = document.createElement("p");
    names.className = "wedding-card__names";
    names.innerHTML = w.names[0] + " <em>&amp;</em> " + w.names[1];

    const date = document.createElement("time");
    date.className = "wedding-card__date";
    date.dateTime = w.date;
    date.textContent = w.dateLabel;

    const cta = document.createElement("span");
    cta.className = "wedding-card__cta";
    cta.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round"/></svg>' +
      "Accéder au film";

    body.appendChild(names);
    body.appendChild(date);
    body.appendChild(cta);
    card.appendChild(media);
    card.appendChild(body);
    li.appendChild(card);
    grid.appendChild(li);

    card.addEventListener("click", function () {
      // Déjà déverrouillé dans cet onglet : on y va directement.
      if (window.WeddingCrypto.recall(w.slug)) {
        window.location.href = filmUrl(w.slug);
        return;
      }
      lastTrigger = card;
      openGate(w);
    });
  });

  /* ---------- Fenêtre mot de passe ---------- */

  function openGate(w) {
    current = w;
    gateNames.innerHTML = w.names[0] + " &amp; " + w.names[1];
    gateDate.dateTime = w.date;
    gateDate.textContent = w.dateLabel;
    error.classList.remove("is-visible");
    input.value = "";
    gate.classList.remove("is-hidden");
    document.body.classList.add("is-locked");
    setTimeout(function () { input.focus(); }, 50);
  }

  function closeGate() {
    gate.classList.add("is-hidden");
    document.body.classList.remove("is-locked");
    current = null;
    if (lastTrigger) lastTrigger.focus();
  }

  closeBtn.addEventListener("click", closeGate);
  backdrop.addEventListener("click", closeGate);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !gate.classList.contains("is-hidden")) closeGate();
  });

  function setBusy(busy) {
    submit.disabled = busy;
    input.disabled = busy;
    gate.classList.toggle("is-busy", busy);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!current) return;

    const entry = vault[current.slug];
    const password = input.value.trim();
    if (!entry || !password) {
      error.classList.add("is-visible");
      return;
    }

    setBusy(true);
    try {
      const payload = await window.WeddingCrypto.decrypt(entry, password);
      window.WeddingCrypto.remember(current.slug, payload);
      window.location.href = filmUrl(current.slug);
    } catch (e) {
      setBusy(false);
      error.classList.add("is-visible");
      input.focus();
      input.select();
    }
  });

  /* ---------- Ouverture directe : index.html?m=slug ---------- */

  const params = new URLSearchParams(window.location.search);
  const wanted = weddings.find(function (w) { return w.slug === params.get("m"); });
  if (wanted) openGate(wanted);
})();
