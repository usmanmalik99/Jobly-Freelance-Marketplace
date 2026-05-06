
import { randomUUID } from "crypto";
import prisma from "../../../lib/prisma";
import { getFirebaseUserFromRequest } from "../../../lib/serverAuth";

function getBaseUrl(req) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  return `${proto}://${host}`;
}

function isDemoMode() {
  return process.env.PAYMENTS_DEMO_MODE !== "false";
}

function normalizeAmountCents(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * 100);
}

async function maybeGetUser(req) {
  try {
    return await getFirebaseUserFromRequest(req);
  } catch (_) {
    return null;
  }
}

async function syncUser(user) {
  if (!user?.uid) return null;
  return prisma.user.upsert({
    where: { uid: user.uid },
    update: { email: user.email, name: user.name || undefined },
    create: { uid: user.uid, email: user.email, name: user.name || user.email },
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const amountCents = normalizeAmountCents(req.body?.amount);
  if (!amountCents || amountCents < 50) {
    return res.status(400).json({ error: "Amount must be at least $0.50." });
  }

  const action = ["pay", "deposit"].includes(req.body?.action) ? req.body.action : "pay";
  const description = action === "deposit" ? "Jobly demo wallet deposit" : "Jobly demo project payment";
  const baseUrl = getBaseUrl(req);
  const user = await maybeGetUser(req);
  await syncUser(user);

  if (isDemoMode()) {
    const demoSessionId = `demo_stripe_${randomUUID()}`;
    const checkoutUrl = `${baseUrl}/payments/success?provider=stripe&mode=demo&session=${demoSessionId}`;

    await prisma.payment.create({
      data: {
        provider: "stripe",
        action,
        amountCents,
        currency: "USD",
        status: "demo_created",
        externalId: demoSessionId,
        checkoutUrl,
        userId: user?.uid || null,
      },
    });

    return res.status(200).json({
      demo: true,
      url: checkoutUrl,
      id: demoSessionId,
      message: "Demo Stripe-style checkout record created. No real card, bank, or payment transfer was processed.",
    });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY is missing. Use PAYMENTS_DEMO_MODE=true for demo mode." });
  }

  const form = new URLSearchParams();
  form.append("mode", "payment");
  form.append("success_url", `${baseUrl}/payments/success?provider=stripe`);
  form.append("cancel_url", `${baseUrl}/payments/cancel?provider=stripe`);
  form.append("line_items[0][quantity]", "1");
  form.append("line_items[0][price_data][currency]", "usd");
  form.append("line_items[0][price_data][unit_amount]", String(amountCents));
  form.append("line_items[0][price_data][product_data][name]", description);
  form.append("metadata[action]", action);
  if (user?.uid) form.append("metadata[firebaseUid]", user.uid);
  if (user?.email) form.append("customer_email", user.email);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const session = await stripeResponse.json().catch(() => ({}));
  if (!stripeResponse.ok) {
    return res.status(stripeResponse.status).json({ error: session?.error?.message || "Stripe Checkout session failed." });
  }

  await prisma.payment.create({
    data: {
      provider: "stripe",
      action,
      amountCents,
      currency: "USD",
      status: "created",
      externalId: session.id,
      checkoutUrl: session.url,
      userId: user?.uid || null,
    },
  });

  return res.status(200).json({ demo: false, url: session.url, id: session.id });
}
