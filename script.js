const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);

    const bars = toggle.querySelectorAll("span");
    if (bars.length === 3) {
      bars[0].style.transform = isOpen ? "translateY(7px) rotate(45deg)" : "";
      bars[1].style.opacity = isOpen ? "0" : "";
      bars[2].style.transform = isOpen ? "translateY(-7px) rotate(-45deg)" : "";
    }
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      toggle.querySelectorAll("span").forEach(span => {
        span.style.transform = "";
        span.style.opacity = "";
      });
    });
  });
}

const currentPage = document.body.dataset.page;
document.querySelectorAll(".main-nav [data-page]").forEach(link => {
  if (link.dataset.page === currentPage) {
    link.classList.add("active");
  }
});

document.querySelectorAll("#year").forEach(el => {
  el.textContent = new Date().getFullYear();
});

const form = document.getElementById("contact-form");

if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();

    const data = new FormData(form);
    const nombre = data.get("nombre") || "";
    const telefono = data.get("telefono") || "";
    const email = data.get("email") || "";
    const servicio = data.get("servicio") || "";
    const mensaje = data.get("mensaje") || "";

    const subject = `Solicitud de presupuesto - ${servicio}`;
    const body =
`Nombre: ${nombre}
Teléfono: ${telefono}
Correo: ${email}
Servicio: ${servicio}

Mensaje:
${mensaje}`;

    const mailto = `mailto:info@domenechservices.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}
