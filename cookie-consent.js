(() => {
  const STORAGE_KEY = "domenech_cookie_consent_v1";
  const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

  const defaults = {
    necessary: true,
    analytics: false,
    marketing: false
  };

  const state = {
    consent: null
  };

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[ch]));

  function loadConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.timestamp || !parsed.categories) return null;

      if (Date.now() - parsed.timestamp > CONSENT_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return {
        timestamp: parsed.timestamp,
        categories: {
          necessary: true,
          analytics: !!parsed.categories.analytics,
          marketing: !!parsed.categories.marketing
        }
      };
    } catch (_) {
      return null;
    }
  }

  function saveConsent(categories) {
    const consent = {
      timestamp: Date.now(),
      categories: {
        necessary: true,
        analytics: !!categories.analytics,
        marketing: !!categories.marketing
      }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    state.consent = consent;

    activateAllowedScripts();
    window.dispatchEvent(new CustomEvent("domenech-cookie-consent", {
      detail: consent.categories
    }));

    return consent;
  }

  function activateAllowedScripts() {
    const consent = state.consent || loadConsent();
    if (!consent) return;

    document.querySelectorAll('script[type="text/plain"][data-cookie-category]').forEach(oldScript => {
      const category = oldScript.dataset.cookieCategory;
      if (!consent.categories[category]) return;
      if (oldScript.dataset.cookieActivated === "true") return;

      const script = document.createElement("script");
      [...oldScript.attributes].forEach(attr => {
        if (!["type", "data-cookie-category", "data-cookie-activated"].includes(attr.name)) {
          script.setAttribute(attr.name, attr.value);
        }
      });

      if (oldScript.src) script.src = oldScript.src;
      else script.textContent = oldScript.textContent;

      oldScript.dataset.cookieActivated = "true";
      oldScript.parentNode.insertBefore(script, oldScript.nextSibling);
    });
  }

  function injectStyles() {
    if (document.getElementById("domenech-cookie-styles")) return;

    const style = document.createElement("style");
    style.id = "domenech-cookie-styles";
    style.textContent = `
      :root{
        --dc-red:#a70e14;
        --dc-dark:#111216;
        --dc-line:#e4e4e8;
        --dc-muted:#6e6f77;
      }

      .dc-cookie-overlay{
        position:fixed;
        inset:0;
        z-index:5000;
        background:rgba(6,7,9,.46);
        backdrop-filter:blur(3px);
      }

      .dc-cookie-banner{
        position:fixed;
        z-index:5001;
        left:50%;
        bottom:24px;
        transform:translateX(-50%);
        width:min(calc(100% - 34px),1100px);
        padding:25px;
        border:1px solid rgba(17,18,22,.08);
        border-radius:22px;
        background:#fff;
        color:var(--dc-dark);
        box-shadow:0 30px 80px rgba(0,0,0,.22);
        font-family:"Inter",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }

      .dc-cookie-banner__grid{
        display:grid;
        grid-template-columns:1fr auto;
        gap:28px;
        align-items:end;
      }

      .dc-cookie-brand{
        display:inline-block;
        margin-bottom:7px;
        color:var(--dc-red);
        font-size:10px;
        line-height:1.2;
        font-weight:800;
        letter-spacing:.15em;
        text-transform:uppercase;
      }

      .dc-cookie-banner h2,
      .dc-cookie-modal h2{
        margin:0;
        color:var(--dc-dark);
        font-family:"Manrope","Inter",sans-serif;
        font-size:22px;
        line-height:1.2;
        letter-spacing:-.03em;
      }

      .dc-cookie-banner p{
        max-width:710px;
        margin:8px 0 0;
        color:var(--dc-muted);
        font-size:13px;
        line-height:1.55;
      }

      .dc-cookie-banner p a,
      .dc-cookie-modal a{
        color:var(--dc-red);
        font-weight:700;
        text-decoration:underline;
        text-underline-offset:2px;
      }

      .dc-cookie-actions{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:9px;
        min-width:430px;
      }

      .dc-cookie-btn{
        min-height:44px;
        padding:0 14px;
        border:1px solid #cfcfd4;
        border-radius:999px;
        background:#fff;
        color:#17181c;
        font-size:12px;
        font-weight:800;
        cursor:pointer;
        transition:.18s ease;
      }

      .dc-cookie-btn:hover{
        transform:translateY(-1px);
        border-color:#8d8e95;
      }

      .dc-cookie-btn--primary{
        border-color:var(--dc-red);
        background:var(--dc-red);
        color:#fff;
      }

      .dc-cookie-btn--primary:hover{
        border-color:#850b10;
        background:#850b10;
      }

      .dc-cookie-modal-wrap{
        position:fixed;
        inset:0;
        z-index:5100;
        display:grid;
        place-items:center;
        padding:20px;
        background:rgba(5,6,8,.66);
        backdrop-filter:blur(4px);
      }

      .dc-cookie-modal{
        width:min(100%,720px);
        max-height:min(760px,calc(100vh - 40px));
        overflow:auto;
        border-radius:24px;
        background:#fff;
        color:var(--dc-dark);
        box-shadow:0 34px 90px rgba(0,0,0,.28);
      }

      .dc-cookie-modal__head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:20px;
        padding:26px 28px 20px;
        border-bottom:1px solid var(--dc-line);
      }

      .dc-cookie-close{
        flex:0 0 auto;
        width:38px;
        height:38px;
        border:1px solid var(--dc-line);
        border-radius:50%;
        background:#fff;
        font-size:22px;
        line-height:1;
        cursor:pointer;
      }

      .dc-cookie-modal__body{
        padding:8px 28px 4px;
      }

      .dc-cookie-intro{
        margin:14px 0 12px;
        color:var(--dc-muted);
        font-size:13px;
      }

      .dc-cookie-category{
        display:grid;
        grid-template-columns:1fr auto;
        gap:18px;
        padding:20px 0;
        border-bottom:1px solid var(--dc-line);
      }

      .dc-cookie-category:last-child{
        border-bottom:0;
      }

      .dc-cookie-category strong{
        display:block;
        margin-bottom:4px;
        font-size:14px;
      }

      .dc-cookie-category p{
        margin:0;
        color:var(--dc-muted);
        font-size:12px;
        line-height:1.55;
      }

      .dc-cookie-category small{
        display:block;
        margin-top:5px;
        color:#92939a;
        font-size:10px;
      }

      .dc-switch{
        position:relative;
        width:48px;
        height:27px;
        margin-top:2px;
      }

      .dc-switch input{
        position:absolute;
        opacity:0;
        pointer-events:none;
      }

      .dc-switch span{
        position:absolute;
        inset:0;
        border-radius:999px;
        background:#c8c9ce;
        transition:.2s ease;
        cursor:pointer;
      }

      .dc-switch span::after{
        content:"";
        position:absolute;
        width:21px;
        height:21px;
        left:3px;
        top:3px;
        border-radius:50%;
        background:#fff;
        box-shadow:0 2px 6px rgba(0,0,0,.18);
        transition:.2s ease;
      }

      .dc-switch input:checked + span{
        background:var(--dc-red);
      }

      .dc-switch input:checked + span::after{
        transform:translateX(21px);
      }

      .dc-switch input:disabled + span{
        cursor:not-allowed;
        background:var(--dc-red);
        opacity:.72;
      }

      .dc-cookie-modal__foot{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:9px;
        padding:20px 28px 26px;
        border-top:1px solid var(--dc-line);
      }

      @media(max-width:850px){
        .dc-cookie-banner{
          bottom:12px;
          padding:21px;
        }

        .dc-cookie-banner__grid{
          grid-template-columns:1fr;
          gap:18px;
        }

        .dc-cookie-actions{
          min-width:0;
          width:100%;
        }
      }

      @media(max-width:570px){
        .dc-cookie-actions,
        .dc-cookie-modal__foot{
          grid-template-columns:1fr;
        }

        .dc-cookie-banner h2,
        .dc-cookie-modal h2{
          font-size:19px;
        }

        .dc-cookie-modal__head,
        .dc-cookie-modal__body,
        .dc-cookie-modal__foot{
          padding-left:19px;
          padding-right:19px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function removeBanner() {
    document.querySelector(".dc-cookie-overlay")?.remove();
    document.querySelector(".dc-cookie-banner")?.remove();
  }

  function closeModal() {
    document.querySelector(".dc-cookie-modal-wrap")?.remove();
  }

  function openPreferences() {
    injectStyles();
    closeModal();

    const current = state.consent || loadConsent();
    const analytics = current?.categories?.analytics ?? false;
    const marketing = current?.categories?.marketing ?? false;

    const wrap = document.createElement("div");
    wrap.className = "dc-cookie-modal-wrap";
    wrap.innerHTML = `
      <section class="dc-cookie-modal" role="dialog" aria-modal="true" aria-labelledby="dc-cookie-title">
        <div class="dc-cookie-modal__head">
          <div>
            <span class="dc-cookie-brand">Domenech Services S.L.</span>
            <h2 id="dc-cookie-title">Configuración de cookies</h2>
          </div>
          <button class="dc-cookie-close" type="button" aria-label="Cerrar">×</button>
        </div>

        <div class="dc-cookie-modal__body">
          <p class="dc-cookie-intro">
            Puedes aceptar o rechazar las categorías opcionales. Las cookies o tecnologías estrictamente necesarias
            no pueden desactivarse porque permiten recordar tus preferencias y mantener funciones básicas del sitio.
            Consulta la <a href="cookies.html">Política de cookies</a>.
          </p>

          <div class="dc-cookie-category">
            <div>
              <strong>Cookies técnicas / necesarias</strong>
              <p>Permiten guardar tu elección de privacidad y prestar funciones esenciales del sitio.</p>
              <small>Siempre activas.</small>
            </div>
            <label class="dc-switch" aria-label="Cookies necesarias siempre activas">
              <input type="checkbox" checked disabled>
              <span></span>
            </label>
          </div>

          <div class="dc-cookie-category">
            <div>
              <strong>Analíticas</strong>
              <p>Servirían para medir de forma agregada el uso de la web y detectar mejoras.</p>
              <small>Actualmente la web no instala herramientas analíticas opcionales.</small>
            </div>
            <label class="dc-switch" aria-label="Permitir cookies analíticas">
              <input id="dc-analytics" type="checkbox" ${analytics ? "checked" : ""}>
              <span></span>
            </label>
          </div>

          <div class="dc-cookie-category">
            <div>
              <strong>Publicidad / marketing</strong>
              <p>Servirían para personalizar publicidad o medir campañas.</p>
              <small>Actualmente la web no instala cookies publicitarias.</small>
            </div>
            <label class="dc-switch" aria-label="Permitir cookies de marketing">
              <input id="dc-marketing" type="checkbox" ${marketing ? "checked" : ""}>
              <span></span>
            </label>
          </div>
        </div>

        <div class="dc-cookie-modal__foot">
          <button class="dc-cookie-btn" type="button" data-dc-action="reject">Rechazar todas</button>
          <button class="dc-cookie-btn" type="button" data-dc-action="save">Guardar selección</button>
          <button class="dc-cookie-btn dc-cookie-btn--primary" type="button" data-dc-action="accept">Aceptar todas</button>
        </div>
      </section>
    `;

    document.body.appendChild(wrap);

    wrap.querySelector(".dc-cookie-close").addEventListener("click", closeModal);
    wrap.addEventListener("click", e => {
      if (e.target === wrap) closeModal();
    });

    wrap.querySelector('[data-dc-action="reject"]').addEventListener("click", () => {
      saveConsent({ ...defaults });
      closeModal();
      removeBanner();
    });

    wrap.querySelector('[data-dc-action="accept"]').addEventListener("click", () => {
      saveConsent({ necessary: true, analytics: true, marketing: true });
      closeModal();
      removeBanner();
    });

    wrap.querySelector('[data-dc-action="save"]').addEventListener("click", () => {
      saveConsent({
        necessary: true,
        analytics: !!wrap.querySelector("#dc-analytics")?.checked,
        marketing: !!wrap.querySelector("#dc-marketing")?.checked
      });
      closeModal();
      removeBanner();
    });
  }

  function showBanner() {
    injectStyles();
    if (document.querySelector(".dc-cookie-banner")) return;

    const overlay = document.createElement("div");
    overlay.className = "dc-cookie-overlay";

    const banner = document.createElement("section");
    banner.className = "dc-cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "dc-banner-title");

    banner.innerHTML = `
      <div class="dc-cookie-banner__grid">
        <div>
          <span class="dc-cookie-brand">Tu privacidad</span>
          <h2 id="dc-banner-title">Cookies y tecnologías similares</h2>
          <p>
            Usamos tecnologías técnicas necesarias para que la web funcione y para recordar tu elección.
            Las categorías opcionales solo se activarían con tu consentimiento.
            Puedes aceptar, rechazar o configurar tus preferencias.
            <a href="cookies.html">Más información</a>.
          </p>
        </div>

        <div class="dc-cookie-actions">
          <button class="dc-cookie-btn" type="button" data-dc-action="reject">Rechazar todas</button>
          <button class="dc-cookie-btn" type="button" data-dc-action="configure">Configurar</button>
          <button class="dc-cookie-btn dc-cookie-btn--primary" type="button" data-dc-action="accept">Aceptar todas</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(banner);

    banner.querySelector('[data-dc-action="reject"]').addEventListener("click", () => {
      saveConsent({ ...defaults });
      removeBanner();
    });

    banner.querySelector('[data-dc-action="accept"]').addEventListener("click", () => {
      saveConsent({ necessary: true, analytics: true, marketing: true });
      removeBanner();
    });

    banner.querySelector('[data-dc-action="configure"]').addEventListener("click", openPreferences);
  }

  function bindSettingsLinks() {
    document.querySelectorAll("[data-cookie-settings]").forEach(link => {
      if (link.dataset.cookieBound === "true") return;
      link.dataset.cookieBound = "true";
      link.addEventListener("click", e => {
        e.preventDefault();
        openPreferences();
      });
    });
  }

  function init() {
    injectStyles();
    bindSettingsLinks();

    state.consent = loadConsent();

    if (state.consent) activateAllowedScripts();
    else showBanner();

    window.DomenechCookies = {
      openPreferences,
      getConsent: () => state.consent || loadConsent(),
      reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        state.consent = null;
        showBanner();
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();