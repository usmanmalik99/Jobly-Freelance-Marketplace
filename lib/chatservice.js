
import { authedFetch } from "./apiClient";

// SQL-backed helper functions. Firebase Auth is only used to get the logged-in user's ID token.
export async function loadConversations(user) {
  return authedFetch(user, "/api/messages");
}

export async function loadThread(user, peerUid) {
  return authedFetch(user, `/api/messages?peerUid=${encodeURIComponent(peerUid)}`);
}

export async function sendMessage(user, { receiverId, recipientEmail, text }) {
  return authedFetch(user, "/api/messages", {
    method: "POST",
    body: JSON.stringify({ receiverId, recipientEmail, text }),
  });
}

export async function searchUsers(user, email) {
  return authedFetch(user, `/api/users/search?email=${encodeURIComponent(email)}`);
}
