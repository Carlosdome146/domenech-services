DOMENECH SERVICES S.L. — VERSIÓN PREMIUM

ESTRUCTURA PRINCIPAL
- index.html
- servicios.html
- trabajos.html
- contacto.html
- styles.css
- script.js
- img/ (logo, hoteles y fotografías optimizadas en WebP)
- functions/api/contacto.js (Cloudflare Pages Function opcional)
- robots.txt
- sitemap.xml
- _headers

MEJORAS DE ESTA VERSIÓN
- Diseño premium y corporativo.
- Inicio con fotografía real a pantalla completa.
- Navegación: Inicio / Servicios / Trabajos / Contacto / Solicitar presupuesto.
- Página independiente de Trabajos con filtros y lightbox.
- Más de 20 fotografías reales optimizadas a WebP.
- Logos de Suitopia, Solymar y RH Ifach.
- Botón flotante de WhatsApp.
- Formulario de contacto con envío directo opcional mediante Cloudflare + Resend.
- Si el backend no está configurado, el formulario usa automáticamente el correo del visitante como fallback.
- SEO básico: meta descriptions, Schema.org, robots.txt y sitemap.xml.
- Cabeceras de seguridad para Cloudflare Pages.

CONFIGURAR EL ENVÍO DIRECTO DEL FORMULARIO EN CLOUDFLARE
1. Despliega el proyecto en Cloudflare Pages.
2. Crea una cuenta/proyecto en Resend y verifica domenechservices.com.
3. En Cloudflare > Settings > Variables and Secrets añade:
   RESEND_API_KEY = tu API key de Resend
   CONTACT_FROM_EMAIL = Domenech Services <web@domenechservices.com>
4. Vuelve a desplegar.

Mientras no configures esas variables, la web seguirá funcionando:
al enviar el formulario abrirá el correo del visitante con el mensaje ya preparado.

DATOS UTILIZADOS
Correo: info@domenechservices.com
Teléfono: +34 629 35 86 23
Domicilio fiscal: C/ Passerell 30, La Nucia 03530


CAMBIOS V2
- Domicilio fiscal eliminado de la web pública.
- Ubicación mostrada: Benidorm · Alicante.
- Logos de hoteles eliminados de la página Contacto para reducir saturación visual.
- Nuevo servicio: Impermeabilización de cubiertas y tratamiento de filtraciones.
  Descripción: sistemas reforzados con fibra y revestimientos impermeabilizantes elásticos.
- Nuevas fotografías de pulido de hormigón.
- Nueva categoría de trabajos: Hormigón.
- Nueva categoría de trabajos: Impermeabilización.
- Nueva sección y categoría: Proyectos internacionales.
- Se incorpora un trabajo real realizado en Ginebra, Suiza.
