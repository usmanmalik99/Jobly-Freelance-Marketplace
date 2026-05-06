import prisma from "../../../lib/prisma";
import { requireUser } from "../../../lib/serverAuth";

function publicJob(job) {
  return {
    id: job.id,
    title: job.title,
    client: job.client,
    clientUid: job.clientUid,
    status: job.status,
    rateType: job.rateType,
    rateCents: job.rateCents,
    totalEarnedCents: job.totalEarnedCents,
    startedAt: job.startedAt,
    dueAt: job.dueAt,
    createdAt: job.createdAt,
  };
}

export default async function handler(req, res) {
  const firebaseUser = await requireUser(req, res);
  if (!firebaseUser) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    await prisma.user.upsert({
      where: { uid: firebaseUser.uid },
      update: {
        email: firebaseUser.email,
        name: firebaseUser.name || firebaseUser.email,
      },
      create: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.name || firebaseUser.email,
      },
    });

    const jobs = await prisma.job.findMany({
      where: { userId: firebaseUser.uid },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      inProgress: jobs.filter((job) => job.status === "in_progress").length,
      pending: jobs.filter((job) => job.status === "pending").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      earningsCents: jobs
        .filter((job) => job.status === "completed")
        .reduce((sum, job) => sum + Number(job.totalEarnedCents || 0), 0),
    };

    return res.status(200).json({
      jobs: jobs.map(publicJob),
      stats,
    });
  } catch (err) {
    console.error("my-jobs api failed", err);
    return res.status(500).json({ error: "Failed to load jobs." });
  }
}
