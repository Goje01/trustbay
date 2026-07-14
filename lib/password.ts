import "server-only";
import crypto from "crypto";

const iterations = 210000;
const keyLength = 64;
const digest = "sha512";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
  return `pbkdf2:${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string) {
  if (!storedHash) return false;
  const [scheme, rawIterations, salt, hash] = storedHash.split(":");
  if (scheme !== "pbkdf2" || !rawIterations || !salt || !hash) return false;

  const candidate = crypto
    .pbkdf2Sync(password, salt, Number(rawIterations), keyLength, digest)
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}
