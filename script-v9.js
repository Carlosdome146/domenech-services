// Mobile navigation
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);

    const bars = toggle.querySelectorAll("span");
    bars[0].style.transform = open ? "translateY(7px) rotate(45deg)" : "";
    bars[1].style.opacity = open ? "0" : "";
    bars[2].style.transform = open ? "translateY(-7px) rotate(-45deg)" : "";
  });

  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      toggle.querySelectorAll("span").forEach(s => {
        s.style.transform = "";
        s.style.opacity = "";
      });
    });
  });
}

// Active page
const currentPage = document.body.dataset.page;
document.querySelectorAll(".main-nav [data-page]").forEach(a => {
  if (a.dataset.page === currentPage) a.classList.add("active");
});

// Year
document.querySelectorAll("#year").forEach(el => {
  el.textContent = new Date().getFullYear();
});

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -35px 0px" });
  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("visible"));
}

// Gallery filters
const filterButtons = document.querySelectorAll(".filter-btn");
const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;

    galleryCards.forEach(card => {
      card.hidden = !(filter === "Todos" || card.dataset.category === filter);
    });
  });
});

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");

if (lightbox && galleryCards.length) {
  let activeCards = [];
  let currentIndex = 0;

  function visibleCards() {
    return galleryCards.filter(c => !c.hidden);
  }

  function showCard(card) {
    if (!card) return;
    lightboxImage.src = card.dataset.src;
    lightboxImage.alt = card.dataset.caption || "";
    lightboxCaption.textContent = card.dataset.caption || "";
  }

  function openLightbox(card) {
    activeCards = visibleCards();
    currentIndex = Math.max(0, activeCards.indexOf(card));
    showCard(activeCards[currentIndex]);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  }

  function step(dir) {
    activeCards = visibleCards();
    currentIndex = (currentIndex + dir + activeCards.length) % activeCards.length;
    showCard(activeCards[currentIndex]);
  }

  galleryCards.forEach(card => card.addEventListener("click", () => openLightbox(card)));
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".prev").addEventListener("click", () => step(-1));
  lightbox.querySelector(".next").addEventListener("click", () => step(1));
  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
}


// GA4 conversion tracking (only after analytics consent)
function analyticsAllowed() {
  const consent = window.DomenechCookies?.getConsent?.();
  return !!consent?.categories?.analytics && typeof window.gtag === "function";
}

function trackAnalyticsEvent(eventName, parameters = {}) {
  if (!analyticsAllowed()) return;

  window.gtag("event", eventName, {
    page_path: window.location.pathname,
    ...parameters
  });
}

function getLinkLocation(link) {
  if (link.classList.contains("whatsapp-float")) return "floating_button";
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  return "content";
}

document.addEventListener("click", event => {
  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href") || "";
  const location = getLinkLocation(link);

  if (/^https:\/\/wa\.me\//i.test(href)) {
    trackAnalyticsEvent("contact_click", {
      contact_method: "whatsapp",
      link_location: location
    });
    return;
  }

  if (/^tel:/i.test(href)) {
    trackAnalyticsEvent("contact_click", {
      contact_method: "phone",
      link_location: location
    });
    return;
  }

  if (/^mailto:/i.test(href)) {
    trackAnalyticsEvent("contact_click", {
      contact_method: "email",
      link_location: location
    });
    return;
  }

  if (/contacto\.html#formulario/i.test(href)) {
    trackAnalyticsEvent("quote_request_click", {
      link_location: location
    });
  }
});

// Contact form: direct send via Cloudflare Worker + Resend
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

if (form) {
  let formStartedAt = Date.now();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const submit = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form).entries());
    data.privacy = !!form.querySelector('[name="privacidad"]')?.checked;
    data.form_started_at = String(formStartedAt);
    data.turnstile_token = String(data["cf-turnstile-response"] || "").trim();
    delete data["cf-turnstile-response"];

    if (!data.turnstile_token) {
      if (statusEl) {
        statusEl.className = "form-status error";
        statusEl.textContent = "Completa la verificación de seguridad antes de enviar.";
      }
      return;
    }

    const original = submit.innerHTML;

    submit.disabled = true;
    submit.textContent = "Enviando…";
    if (statusEl) {
      statusEl.className = "form-status";
      statusEl.textContent = "";
    }

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify(data)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        const error = new Error(result.error || "No se pudo completar el envío");
        error.status = response.status;
        error.code = result.code || `http_${response.status}`;
        throw error;
      }

      if (statusEl) {
        statusEl.className = "form-status success";
        statusEl.textContent = "Solicitud enviada correctamente.";
      }

      trackAnalyticsEvent("generate_lead", {
        lead_source: "website_contact_form",
        service_name: data.servicio || "not_specified"
      });

      form.reset();
      if (window.turnstile) window.turnstile.reset();
      formStartedAt = Date.now();
    } catch (error) {
      if (window.turnstile) window.turnstile.reset();

      console.warn("Contact form error", {
        status: error.status || 0,
        code: error.code || "network_error"
      });

      if (statusEl) {
        statusEl.className = "form-status error";

        if (error.code === "turnstile_failed") {
          statusEl.textContent = "La verificación de seguridad no se ha podido validar. Inténtalo de nuevo.";
        } else if (error.code === "rate_limited" || error.status === 429) {
          statusEl.textContent = "Has realizado un envío hace muy poco. Espera unos segundos e inténtalo de nuevo.";
        } else if (error.code === "request_blocked") {
          statusEl.textContent = "La solicitud ha sido bloqueada por seguridad. Recarga la página e inténtalo de nuevo.";
        } else {
          statusEl.textContent = "No se ha podido enviar la solicitud. Inténtalo de nuevo en unos instantes.";
        }
      }
    } finally {
      submit.disabled = false;
      submit.innerHTML = original;
    }
  });
}
