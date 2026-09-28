import "server-only";
import { createHmac } from "node:crypto";

/**
 * Secret for signing contact-form tokens, derived from the Resend key so no
 * extra env var is needed. Server-only: never export this from a "use server" file.
 */
export function contactTokenSecret(): string {
  const key = process.env.RESEND_API_KEY ?? "contact-form-unconfigured";
  return createHmac("sha256", key).update("payback-contact-form-token").digest("hex");
}
