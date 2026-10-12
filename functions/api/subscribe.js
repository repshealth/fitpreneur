/**
 * Cloudflare Pages Function: POST /api/subscribe
 * Adds a newsletter subscriber to MailerLite.
 *
 * Set these in Cloudflare Pages > Settings > Environment variables:
 *   MAILERLITE_API_KEY   (required, mark as "Encrypt"/secret)
 *   MAILERLITE_GROUP_ID  (optional, the group to add subscribers to)
 */
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export async function onRequestPost({ request, env }) {
  let data;
  try {
    const type = request.headers.get("content-type") || "";
    data = type.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: bots fill the hidden "company" field
  if (data.company) return json({ ok: true });

  const name = String(data.name || "").trim().slice(0, 100);
  const email = String(data.email || "").trim().toLowerCase().slice(0, 254);
  if (!name) return json({ error: "Please add your name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Please enter a valid email address." }, 400);

  if (!env.MAILERLITE_API_KEY) {
    return json({ error: "Newsletter is not configured yet. Please email james@fitpreneuragency.com." }, 500);
  }

  const payload = { email, fields: { name } };
  if (env.MAILERLITE_GROUP_ID) payload.groups = [String(env.MAILERLITE_GROUP_ID)];

  const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) return json({ ok: true });
  return json({ error: "We couldn't sign you up just now. Please try again shortly." }, 502);
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
