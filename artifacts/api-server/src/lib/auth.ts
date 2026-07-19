import { createHash, randomBytes, timingSafeEqual } from "crypto";

// ---------------------------------------------------------------------------
// Token helpers (base64-encoded, no external deps)
// ---------------------------------------------------------------------------

export function makeToken(userId: number): string {
  const nonce = randomBytes(8).toString("hex");
  return Buffer.from(`cargo:${userId}:${nonce}`).toString("base64url");
}

export function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    // Also accept old base64 tokens
    const decoded2 = Buffer.from(token, "base64").toString("utf-8");
    const raw = decoded.startsWith("cargo:") ? decoded : decoded2;
    const parts = raw.split(":");
    if (parts[0] !== "cargo") return null;
    const id = parseInt(parts[1], 10);
    return isNaN(id) ? null : id;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Password hashing (Node built-in crypto — no bcrypt dep needed)
// ---------------------------------------------------------------------------

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(salt + plain).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  // Legacy plaintext passwords (no colon separator pattern)
  if (!stored.includes(":")) {
    return stored === plain;
  }
  const [salt, hash] = stored.split(":");
  const candidate = createHash("sha256").update(salt + plain).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
  } catch {
    return false;
  }
}
