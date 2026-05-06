import prisma from "../../../lib/prisma";
import { requireUser } from "../../../lib/serverAuth";

function publicUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

function messagePreview(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "You received a new message.";
  return clean.length > 120 ? `${clean.slice(0, 117)}...` : clean;
}

function jobStatusLabel(status) {
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  return "Pending";
}

function jobNotificationTitle(status) {
  if (status === "in_progress") return "Job is now in progress";
  if (status === "completed") return "Job marked completed";
  return "New pending job";
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

    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: firebaseUser.uid,
        readAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        sender: {
          select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    const activeJobs = await prisma.job.findMany({
      where: {
        userId: firebaseUser.uid,
        status: { in: ["pending", "in_progress", "completed"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    const messageItems = unreadMessages.map((message) => ({
      id: `message-${message.id}`,
      type: "message",
      title: `New message from ${message.sender?.name || message.sender?.email || "a client"}`,
      body: messagePreview(message.text),
      createdAt: message.createdAt,
      href: `/messages?peerUid=${message.senderId}`,
      unread: true,
      peer: publicUser(message.sender),
    }));

    const jobItems = activeJobs.map((job) => ({
      id: `job-${job.id}`,
      type: "job",
      title: jobNotificationTitle(job.status),
      body: `${job.title}${job.client ? ` from ${job.client}` : ""} · ${jobStatusLabel(job.status)}`,
      createdAt: job.updatedAt || job.createdAt,
      href: "/myjobs",
      unread: job.status !== "completed",
      job: {
        id: job.id,
        title: job.title,
        client: job.client,
        status: job.status,
      },
    }));

    const items = [...messageItems, ...jobItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    return res.status(200).json({
      count: items.length,
      unreadCount: messageItems.length + jobItems.filter((item) => item.unread).length,
      items,
    });
  } catch (err) {
    console.error("notifications api failed", err);
    return res.status(500).json({ error: "Failed to load notifications." });
  }
}
