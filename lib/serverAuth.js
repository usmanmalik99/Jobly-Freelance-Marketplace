
const FIREBASE_LOOKUP_URL = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

export async function getFirebaseUserFromRequest(req) {
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error("Missing Firebase ID token.");
    err.statusCode = 401;
    throw err;
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    const err = new Error("NEXT_PUBLIC_FIREBASE_API_KEY is missing on the server.");
    err.statusCode = 500;
    throw err;
  }

  const response = await fetch(`${FIREBASE_LOOKUP_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.users?.length) {
    const err = new Error("Invalid or expired Firebase ID token.");
    err.statusCode = 401;
    throw err;
  }

  const account = payload.users[0];
  const displayName = account.displayName || null;
  return {
    uid: account.localId,
    email: String(account.email || "").toLowerCase(),
    name: displayName,
  };
}

export async function requireUser(req, res) {
  try {
    return await getFirebaseUserFromRequest(req);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "Authentication failed." });
    return null;
  }
}
