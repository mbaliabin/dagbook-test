// src/utils/getUserIdFromToken.ts
export function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.userId || payload.id || payload.sub || null;
  } catch {
    return null;
  }
}

