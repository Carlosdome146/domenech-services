const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");
const year = document.getElementById("year");
const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");

const setHeaderState = () => {
  header.classList.toggle("scrolled", window.scrollY > 18);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú");
      document.body.classList.remove("menu-open");
    });
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.textContent = "Datos recibidos";
    submitButton.disabled = true;

    if (formNote) {
      formNote.textContent =
        "Formulario preparado. En el siguiente paso lo conectaremos al WhatsApp o correo oficial de Domenech Services.";
      formNote.classList.add("success");
    }

    window.setTimeout(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }, 2600);
  });
}
