
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
  if (!amountCents) return res.status(400).json({ error: "Enter a valid crypto payment amount." });

  const action = ["pay", "deposit"].includes(req.body?.action) ? req.body.action : "pay";
  const baseUrl = getBaseUrl(req);
  const user = await maybeGetUser(req);
  await syncUser(user);
  const amount = (amountCents / 100).toFixed(2);
  const description = action === "deposit" ? "Jobly demo crypto wallet deposit" : "Jobly demo crypto project payment";

  if (isDemoMode()) {
    const demoChargeId = `demo_coinbase_${randomUUID()}`;
    const checkoutUrl = `${baseUrl}/payments/success?provider=coinbase&mode=demo&charge=${demoChargeId}`;

    await prisma.payment.create({
      data: {
        provider: "coinbase",
        action,
        amountCents,
        currency: "USD",
        status: "demo_created",
        externalId: demoChargeId,
        checkoutUrl,
        userId: user?.uid || null,
      },
    });

    return res.status(200).json({
      demo: true,
      url: checkoutUrl,
      id: demoChargeId,
      code: demoChargeId,
      message: "Demo Coinbase-style charge record created. No real crypto payment was processed.",
    });
  }

  const coinbaseKey = process.env.COINBASE_COMMERCE_API_KEY;
  if (!coinbaseKey) {
    return res.status(500).json({ error: "COINBASE_COMMERCE_API_KEY is missing. Use PAYMENTS_DEMO_MODE=true for demo mode." });
  }

  const coinbaseResponse = await fetch("https://api.commerce.coinbase.com/charges", {
    method: "POST",
    headers: {
      "X-CC-Api-Key": coinbaseKey,
      "Content-Type": "application/json",
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify({
      name: description,
      description,
      pricing_type: "fixed_price",
      local_price: { amount, currency: "USD" },
      redirect_url: `${baseUrl}/payments/success?provider=coinbase`,
      cancel_url: `${baseUrl}/payments/cancel?provider=coinbase`,
      metadata: {
        action,
        firebaseUid: user?.uid || "guest",
        email: user?.email || "guest",
      },
    }),
  });

  const payload = await coinbaseResponse.json().catch(() => ({}));
  if (!coinbaseResponse.ok) {
    return res.status(coinbaseResponse.status).json({ error: payload?.error?.message || payload?.message || "Coinbase charge creation failed." });
  }

  const charge = payload?.data || payload;
  await prisma.payment.create({
    data: {
      provider: "coinbase",
      action,
      amountCents,
      currency: "USD",
      status: "created",
      externalId: charge.id || charge.code || null,
      checkoutUrl: charge.hosted_url || null,
      userId: user?.uid || null,
    },
  });

  return res.status(200).json({ demo: false, url: charge.hosted_url, id: charge.id, code: charge.code });
}
