
import prisma from "../../../lib/prisma";
import { requireUser } from "../../../lib/serverAuth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const firebaseUser = await requireUser(req, res);
  if (!firebaseUser) return;

  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email || email.length < 3) {
    return res.status(200).json({ users: [] });
  }

  await prisma.user.upsert({
    where: { uid: firebaseUser.uid },
    update: { email: firebaseUser.email, name: firebaseUser.name || undefined },
    create: { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.name || firebaseUser.email },
  });

  const users = await prisma.user.findMany({
    where: {
      email: { contains: email },
      NOT: { uid: firebaseUser.uid },
    },
    orderBy: { email: "asc" },
    take: 8,
    select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true },
  });

  return res.status(200).json({ users });
}
