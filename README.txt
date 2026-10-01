DOMENECH SERVICES S.L. — ESTADO ACTUAL

ARQUITECTURA
- Hosting y ejecución: Cloudflare Workers + Static Assets.
- Repositorio: Carlosdome146/domenech-services
- Rama de producción: main
- Despliegue: npx wrangler deploy
- Configuración: wrangler.jsonc
- Worker principal: worker.js
- Assets estáticos: HTML, CSS, JavaScript e imágenes del repositorio.
- API de contacto: POST /api/contacto
- Lógica del formulario: functions/api/contacto.js
- Envío de correo: Resend.
- Protección antispam: Cloudflare Turnstile + honeypot + validaciones + rate limiting.
- Analítica: Google Analytics 4, ID G-DGFJ2F2ZW5, cargado únicamente tras consentimiento analítico.

ARCHIVOS PRINCIPALES
- index.html
- servicios.html
- trabajos.html
- contacto.html
- styles-v44.css
- script-v8.js
- cookie-consent-v2.js
- worker.js
- wrangler.jsonc
- .assetsignore
- functions/api/contacto.js
- robots.txt
- sitemap.xml
- sitemap-pages.xml
- sitemap-images.xml
- _headers
- img/

FORMULARIO DE CONTACTO
Flujo:
contacto.html
→ Cloudflare Turnstile
→ POST /api/contacto
→ worker.js
→ functions/api/contacto.js
→ Resend
→ domenechservices@gmail.com

Variables de runtime necesarias en Cloudflare:
- RESEND_API_KEY (Secret)
- TURNSTILE_SECRET_KEY (Secret)
- CONTACT_FROM_EMAIL = Domenech Services <web@domenechservices.com>

El dominio domenechservices.com debe permanecer verificado en Resend.
El Site Key de Turnstile es público y se integra en contacto.html.
Las claves secretas nunca deben guardarse en GitHub.

COOKIES Y ANALÍTICA
- Consentimiento almacenado con la clave domenech_cookie_consent_v2.
- Google Analytics 4 no se carga hasta aceptar la categoría Analíticas.
- Política de cookies y privacidad actualizadas para GA4.

SEO
- Canonical y meta description por página.
- Schema.org en Inicio y landings de servicio.
- Sitemap de páginas e imágenes.
- Landings específicas para servicios y provincias.
- 404 marcado noindex.
- Imágenes principales en WebP y lazy loading cuando procede.

DATOS DE EMPRESA
- Domenech Services S.L.
- CIF: B93815306
- Teléfono: +34 629 35 86 23
- Email: domenechservices@gmail.com
- Cobertura principal: Comunidad Valenciana.
- Instagram y Facebook enlazados desde la web.

NOTAS DE MANTENIMIENTO
- No añadir secretos al repositorio.
- Tras cambios importantes de JavaScript, versionar el nombre del archivo para evitar caché antigua.
- Las variables RESEND_API_KEY y TURNSTILE_SECRET_KEY deben existir en Runtime Secrets, no solo como variables de compilación.
- El Worker sirve /api/* mediante código y el resto mediante env.ASSETS.
