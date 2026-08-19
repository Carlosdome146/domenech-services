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


CAMBIOS V3 — LEGAL Y COOKIES
- Añadido aviso-legal.html
- Añadido privacidad.html
- Añadido cookies.html
- Añadido cookie-consent.js
- Banner de consentimiento con:
  RECHAZAR TODAS | CONFIGURAR | ACEPTAR TODAS
  Las tres opciones aparecen al mismo nivel.
- Panel de configuración con categorías:
  técnicas/necesarias, analíticas y marketing.
- La elección se guarda en localStorage con la clave:
  domenech_cookie_consent_v1
  y se vuelve a solicitar transcurridos 12 meses.
- En todas las páginas se añade al footer:
  Aviso legal | Privacidad | Cookies | Configurar cookies
- El formulario enlaza expresamente a la Política de privacidad.
- Actualmente no hay cookies analíticas o publicitarias activas.
  El sistema queda preparado para bloquear futuros scripts opcionales hasta obtener consentimiento.

IMPORTANTE PARA CERRAR EL AVISO LEGAL
Falta incorporar el NIF/CIF de Domenech Services S.L. y, si corresponde,
los datos de inscripción en el Registro Mercantil. No se han inventado esos datos.
La ubicación pública se mantiene como Benidorm · Alicante, según lo solicitado.
