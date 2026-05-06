
import prisma from "../../../lib/prisma";
import { requireUser } from "../../../lib/serverAuth";

function normalizeAmountCents(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * 100);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const firebaseUser = await requireUser(req, res);
  if (!firebaseUser) return;

  const method = ["bank", "crypto"].includes(req.body?.method) ? req.body.method : null;
  const amountCents = normalizeAmountCents(req.body?.amount);
  const destination = String(req.body?.destination || "").trim().slice(0, 500);

  if (!method || !amountCents || !destination) {
    return res.status(400).json({ error: "Method, amount, and destination are required." });
  }

  await prisma.user.upsert({
    where: { uid: firebaseUser.uid },
    update: { email: firebaseUser.email, name: firebaseUser.name || undefined },
    create: { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.name || firebaseUser.email },
  });

  const request = await prisma.withdrawalRequest.create({
    data: {
      userId: firebaseUser.uid,
      method,
      amountCents,
      currency: "USD",
      destination,
      status: "pending_review",
    },
  });

  return res.status(201).json({ request });
}
