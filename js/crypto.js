/* ================================================================
   DÉCHIFFREMENT DU CONTENU PRIVÉ
   ----------------------------------------------------------------
   Le mot de passe n'est stocké nulle part. Il sert à dériver une
   clé (PBKDF2-SHA256) qui déchiffre le bloc AES-GCM du mariage.
   Mauvais mot de passe = déchiffrement impossible.
================================================================ */

window.WeddingCrypto = (function () {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function fromB64(str) {
    return Uint8Array.from(atob(str), function (c) { return c.charCodeAt(0); });
  }

  function toB64(bytes) {
    let bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  async function deriveKey(password, salt, iterations, usage) {
    const baseKey = await crypto.subtle.importKey(
      "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      [usage]
    );
  }

  /* Renvoie le contenu privé (objet) ou lève une erreur si le mot de passe est faux. */
  async function decrypt(entry, password) {
    const key = await deriveKey(password, fromB64(entry.salt), entry.iter, "decrypt");
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(entry.iv) },
      key,
      fromB64(entry.ct)
    );
    return JSON.parse(dec.decode(plain));
  }

  /* Utilisé par tools/chiffrer.html pour générer un bloc. */
  async function encrypt(data, password, iterations) {
    iterations = iterations || 600000;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt, iterations, "encrypt");
    const ct = new Uint8Array(await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(JSON.stringify(data))
    ));
    return { iter: iterations, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
  }

  /* Stockage de session : le visiteur n'a pas à retaper le mot de passe
     tant que l'onglet reste ouvert. */
  const PREFIX = "cc-wedding-";

  /* Le déverrouillage mémorisé est lié à la version du bloc chiffré :
     si le contenu du mariage est mis à jour (film, photos, mot de
     passe), l'ancienne mémoire est ignorée et le mot de passe redemandé. */
  function currentStamp(slug) {
    const entry = (window.VAULT || {})[slug];
    return entry ? entry.ct.slice(0, 32) : null;
  }

  function remember(slug, payload) {
    try {
      sessionStorage.setItem(PREFIX + slug, JSON.stringify({ stamp: currentStamp(slug), payload: payload }));
    } catch (e) { /* ignore */ }
  }

  function recall(slug) {
    try {
      const raw = sessionStorage.getItem(PREFIX + slug);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (!saved || !saved.stamp || saved.stamp !== currentStamp(slug)) {
        sessionStorage.removeItem(PREFIX + slug);
        return null;
      }
      return saved.payload;
    } catch (e) {
      return null;
    }
  }

  /* Les noms de fichiers accentués (ex. « LÉNA ») peuvent être stockés
     sur R2 sous deux formes Unicode selon l'ordinateur d'origine
     (Windows vs Mac). Renvoie l'autre forme de l'URL, ou null. */
  function altUrl(url) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").map(function (seg) { return decodeURIComponent(seg); });
      const joined = parts.join("/");
      const target = joined === joined.normalize("NFC") ? "NFD" : "NFC";
      const alt = parts.map(function (seg) { return encodeURIComponent(seg.normalize(target)); }).join("/");
      if (alt === u.pathname) return null;
      return u.origin + alt + u.search;
    } catch (e) {
      return null;
    }
  }

  /* Charge une image ; si elle échoue, réessaie avec l'autre forme d'URL. */
  function setImgWithFallback(img, url) {
    img.onerror = function () {
      const alt = altUrl(url);
      img.onerror = null;
      if (alt) img.src = alt;
    };
    img.src = url;
  }

  return {
    decrypt: decrypt, encrypt: encrypt, remember: remember, recall: recall,
    altUrl: altUrl, setImgWithFallback: setImgWithFallback
  };
})();
