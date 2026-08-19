export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL) {
    return new Response(
      JSON.stringify({ ok: false, error: "Email service not configured" }),
      { status: 503, headers }
    );
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { status: 400, headers });
  }

  const clean = (value, max = 2000) =>
    String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);

  const nombre = clean(data.nombre, 120);
  const telefono = clean(data.telefono, 80);
  const email = clean(data.email, 180);
  const servicio = clean(data.servicio, 220);
  const localidad = clean(data.localidad, 160);
  const mensaje = clean(data.mensaje, 4000);

  if (!nombre || !telefono || !servicio || !mensaje) {
    return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), { status: 400, headers });
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
      to: ["info@domenechservices.com"],
      reply_to: email || undefined,
      subject: `Solicitud de presupuesto - ${servicio}`,
      text
    })
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    return new Response(JSON.stringify({ ok: false, error: "Email provider error", detail }), { status: 502, headers });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
