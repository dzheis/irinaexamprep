import crypto from "crypto";

export function generateCsrfToken(): string {
  return crypto.randomBytes(16).toString("hex");
}
