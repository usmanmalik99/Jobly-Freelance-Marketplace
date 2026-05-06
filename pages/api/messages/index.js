
import prisma from "../../../lib/prisma";
import { requireUser } from "../../../lib/serverAuth";

function cleanText(value) {
  return String(value || "").trim().slice(0, 2000);
}

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

async function syncCurrentUser(firebaseUser) {
  return prisma.user.upsert({
    where: { uid: firebaseUser.uid },
    update: { email: firebaseUser.email, name: firebaseUser.name || undefined },
    create: {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.name || firebaseUser.email,
    },
  });
}

function buildConversations(messages, meUid) {
  const map = new Map();

  for (const message of messages) {
    const peer = message.senderId === meUid ? message.receiver : message.sender;
    if (!peer || map.has(peer.uid)) continue;

    map.set(peer.uid, {
      peer: publicUser(peer),
      lastMessage: {
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        senderId: message.senderId,
        receiverId: message.receiverId,
      },
    });
  }

  return Array.from(map.values());
}

export default async function handler(req, res) {
  const firebaseUser = await requireUser(req, res);
  if (!firebaseUser) return;

  try {
    await syncCurrentUser(firebaseUser);

    if (req.method === "GET") {
      const peerUid = String(req.query.peerUid || "").trim();

      if (peerUid) {
        const peer = await prisma.user.findUnique({
          where: { uid: peerUid },
          select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true },
        });

        if (!peer) return res.status(404).json({ error: "That user was not found in SQL." });

        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: firebaseUser.uid, receiverId: peerUid },
              { senderId: peerUid, receiverId: firebaseUser.uid },
            ],
          },
          orderBy: { createdAt: "asc" },
          take: 200,
          include: {
            sender: { select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true } },
            receiver: { select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true } },
          },
        });

        await prisma.message.updateMany({
          where: {
            senderId: peerUid,
            receiverId: firebaseUser.uid,
            readAt: null,
          },
          data: { readAt: new Date() },
        });

        return res.status(200).json({ peer, messages });
      }

      const recentMessages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: firebaseUser.uid }, { receiverId: firebaseUser.uid }],
        },
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          sender: { select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true } },
          receiver: { select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true } },
        },
      });

      return res.status(200).json({
        conversations: buildConversations(recentMessages, firebaseUser.uid),
      });
    }

    if (req.method === "POST") {
      const text = cleanText(req.body?.text);
      const receiverId = String(req.body?.receiverId || "").trim();
      const recipientEmail = String(req.body?.recipientEmail || "").trim().toLowerCase();

      if (!text) return res.status(400).json({ error: "Message cannot be empty." });

      let receiver = null;
      if (receiverId) receiver = await prisma.user.findUnique({ where: { uid: receiverId } });
      if (!receiver && recipientEmail) receiver = await prisma.user.findUnique({ where: { email: recipientEmail } });

      if (!receiver) {
        return res.status(404).json({
          error: "No SQL user found for that recipient. Ask them to sign up or log in once first.",
        });
      }

      if (receiver.uid === firebaseUser.uid) {
        return res.status(400).json({ error: "You cannot message yourself." });
      }

      const message = await prisma.message.create({
        data: {
          senderId: firebaseUser.uid,
          receiverId: receiver.uid,
          text,
        },
        include: {
          sender: { select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true } },
          receiver: { select: { uid: true, email: true, name: true, firstName: true, lastName: true, role: true } },
        },
      });

      return res.status(201).json({ message });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    console.error("messages api failed", err);
    return res.status(500).json({ error: "Messages API failed." });
  }
}
