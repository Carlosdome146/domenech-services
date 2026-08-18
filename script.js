const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    });
  });
}

document.querySelectorAll("#year").forEach(el => {
  el.textContent = new Date().getFullYear();
});

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const nombre = data.get("nombre") || "";
    const telefono = data.get("telefono") || "";
    const email = data.get("email") || "";
    const servicio = data.get("servicio") || "";
    const mensaje = data.get("mensaje") || "";

    const subject = `Solicitud de información - ${servicio}`;
    const body =
`Nombre: ${nombre}
Teléfono: ${telefono}
Correo: ${email}
Servicio: ${servicio}

Mensaje:
${mensaje}`;

    const mailto =
      `mailto:info@domenechservices.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  });
}
