
import prisma from "../../../lib/prisma";
import { requireUser } from "../../../lib/serverAuth";

function clean(value, max = 100) {
  return String(value || "").trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const firebaseUser = await requireUser(req, res);
  if (!firebaseUser) return;

  const firstName = clean(req.body?.firstName);
  const lastName = clean(req.body?.lastName);
  const role = clean(req.body?.role, 40);
  const cleanName = `${firstName} ${lastName}`.trim() || firebaseUser.name || firebaseUser.email;

  try {
    const user = await prisma.user.upsert({
      where: { uid: firebaseUser.uid },
      update: {
        email: firebaseUser.email,
        name: cleanName,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role: role || undefined,
      },
      create: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: cleanName,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || null,
      },
    });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("sync user failed", err);
    return res.status(500).json({ error: "Could not sync user profile to SQL." });
  }
}
