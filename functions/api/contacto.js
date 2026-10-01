const ALLOWED_ORIGINS = new Set([
  "https://domenechservices.com",
  "https://www.domenechservices.com"
]);

const ALLOWED_SERVICES = new Set([
  "Pulido y cristalizado de suelos y escaleras",
  "Limpieza de moquetas, alfombras y tapicerías",
  "Limpieza de cristales",
  "Impermeabilización de cubiertas y tratamiento de filtraciones",
  "Varios servicios / Otro"
]);

const MAX_BODY_BYTES = 16_000;
const MIN_FILL_TIME_MS = 3_000;
const MAX_FILL_TIME_MS = 2 * 60 * 60 * 1000;
const RATE_LIMIT_SECONDS = 30;
const TURNSTILE_ACTION = "contact-form";

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders
  });
}

function clean(value, max = 2000) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function validEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

async function verifyTurnstile(token, request, secret) {
  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);

  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) formData.append("remoteip", ip);

  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData
    }
  );

  if (!verifyResponse.ok) {
    console.error("Turnstile Siteverify HTTP error", verifyResponse.status);
    return false;
  }

  const outcome = await verifyResponse.json();

  if (!outcome.success) {
    console.warn("Turnstile rejected request", outcome["error-codes"] || []);
    return false;
  }

  if (!ALLOWED_ORIGINS.has(`https://${outcome.hostname}`)) {
    console.warn("Turnstile hostname mismatch", outcome.hostname);
    return false;
  }

  if (outcome.action !== TURNSTILE_ACTION) {
    console.warn("Turnstile action mismatch", outcome.action);
    return false;
  }

  return true;
}

async function isRateLimited(request) {
  try {
    const ip = request.headers.get("CF-Connecting-IP");
    if (!ip || typeof caches === "undefined" || !caches.default) return false;

    const cache = caches.default;
    const key = new Request(
      `https://domenechservices.com/__contact-rate-limit/${encodeURIComponent(ip)}`,
      { method: "GET" }
    );

    const existing = await cache.match(key);
    if (existing) return true;

    await cache.put(
      key,
      new Response("1", {
        headers: { "Cache-Control": `public, max-age=${RATE_LIMIT_SECONDS}` }
      })
    );
  } catch (error) {
    console.warn("Contact rate-limit cache unavailable", error);
  }

  return false;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get("Origin");
  const secFetchSite = request.headers.get("Sec-Fetch-Site");
  const contentType = request.headers.get("Content-Type") || "";
  const contentLength = Number(request.headers.get("Content-Length") || 0);

  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return json({ ok: false, error: "Request not allowed", code: "request_blocked" }, 403);
  }

  if (secFetchSite && !["same-origin", "same-site"].includes(secFetchSite)) {
    return json({ ok: false, error: "Request not allowed", code: "request_blocked" }, 403);
  }

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ ok: false, error: "Unsupported content type", code: "request_blocked" }, 415);
  }

  if (contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Request too large", code: "request_blocked" }, 413);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.TURNSTILE_SECRET_KEY) {
    console.error("Contact configuration missing", {
      resend: !!env.RESEND_API_KEY,
      from: !!env.CONTACT_FROM_EMAIL,
      turnstile: !!env.TURNSTILE_SECRET_KEY
    });
    return json({ ok: false, error: "Server configuration error", code: "config_missing" }, 503);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  if (JSON.stringify(data).length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Request too large" }, 413);
  }

  // Honeypot: los usuarios reales nunca ven ni rellenan este campo.
  if (clean(data.website, 200)) {
    return json({ ok: true });
  }

  const startedAt = Number(data.form_started_at);
  const elapsed = Date.now() - startedAt;
  if (
    !Number.isFinite(startedAt) ||
    elapsed < MIN_FILL_TIME_MS ||
    elapsed > MAX_FILL_TIME_MS
  ) {
    return json({ ok: false, error: "Invalid form timing" }, 400);
  }

  const nombre = clean(data.nombre, 120);
  const telefono = clean(data.telefono, 80);
  const email = clean(data.email, 180);
  const servicio = clean(data.servicio, 220);
  const localidad = clean(data.localidad, 160);
  const mensaje = clean(data.mensaje, 4000);
  const turnstileToken = clean(data.turnstile_token, 2048);
  const privacyAccepted =
    data.privacy === true ||
    data.privacy === "true" ||
    data.privacy === "on";

  if (
    !nombre ||
    !telefono ||
    !servicio ||
    !mensaje ||
    !turnstileToken ||
    !privacyAccepted
  ) {
    return json({ ok: false, error: "Missing required fields" }, 400);
  }

  if (
    nombre.length < 2 ||
    mensaje.length < 10 ||
    !validPhone(telefono) ||
    !validEmail(email) ||
    !ALLOWED_SERVICES.has(servicio)
  ) {
    return json({ ok: false, error: "Invalid form data" }, 400);
  }

  const turnstileOk = await verifyTurnstile(
    turnstileToken,
    request,
    env.TURNSTILE_SECRET_KEY
  );

  if (!turnstileOk) {
    return json(
      { ok: false, error: "Security verification failed", code: "turnstile_failed" },
      403
    );
  }

  if (await isRateLimited(request)) {
    return json({ ok: false, error: "Too many requests", code: "rate_limited" }, 429);
  }

  const text = [
    "Nueva solicitud de presupuesto desde domenechservices.com",
    "",
    `Nombre: ${nombre}`,
    `Teléfono: ${telefono}`,
    `Correo: ${email || "-"}`,
    `Servicio: ${servicio}`,
    `Localidad: ${localidad || "-"}`,
    "",
    "Mensaje:",
    mensaje
  ].join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: ["domenechservices@gmail.com"],
      reply_to: email || undefined,
      subject: `Solicitud de presupuesto - ${servicio}`,
      text
    })
  });

  if (!resendResponse.ok) {
    const providerDetail = await resendResponse.text();
    console.error("Resend contact error", resendResponse.status, providerDetail);

    let code = "resend_provider";
    let status = 502;

    if (resendResponse.status === 401 || resendResponse.status === 403) {
      code = "resend_auth";
      status = 503;
    } else if (resendResponse.status === 422) {
      code = "resend_sender";
      status = 503;
    } else if (resendResponse.status === 429) {
      code = "resend_rate_limit";
      status = 503;
    }

    return json(
      {
        ok: false,
        error: "Email provider error",
        code,
        provider_status: resendResponse.status
      },
      status
    );
  }

  const resendData = await resendResponse.json().catch(() => ({}));
  console.log("Contact email sent", resendData.id || "accepted");

  return json({ ok: true, id: resendData.id || null });
}


export async function onRequestGet(context) {
  const { env } = context;

  return json({
    ok: true,
    service: "contacto",
    build: "2026-10-01-v2",
    environment: {
      RESEND_API_KEY: !!env.RESEND_API_KEY,
      CONTACT_FROM_EMAIL: !!env.CONTACT_FROM_EMAIL,
      TURNSTILE_SECRET_KEY: !!env.TURNSTILE_SECRET_KEY
    }
  });
}
