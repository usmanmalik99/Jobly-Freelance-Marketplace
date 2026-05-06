
export async function authedFetch(user, url, options = {}) {
  if (!user) throw new Error("You must be logged in.");
  const token = await user.getIdToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  return data;
}

export async function syncCurrentUser(user, profile = {}) {
  if (!user) return null;
  return authedFetch(user, "/api/users/sync", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}
