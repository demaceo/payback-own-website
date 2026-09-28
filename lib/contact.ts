/* ============================================================
   Contact form core: validation, spam guards and the Resend call.
   Framework-free so it can be unit-tested with plain Node.
   ============================================================ */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { LIMITS, type ContactField, type ContactInput } from "./contact-fields.ts";

export * from "./contact-fields.ts";

const MIN_FILL_MS = 3_000; // humans don't finish the form in under 3 s
const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_LINKS = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- Validation ---------- */

export function readInput(get: (key: string) => unknown): ContactInput {
  const str = (k: string) => (typeof get(k) === "string" ? (get(k) as string).trim() : "");
  return { name: str("name"), email: str("email"), subject: str("subject"), message: str("message") };
}

export function validate(input: ContactInput): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  if (!input.name) errors.name = "Please enter your name.";
  else if (input.name.length > LIMITS.name.max) errors.name = `Please keep your name under ${LIMITS.name.max} characters.`;

  if (!EMAIL_RE.test(input.email) || input.email.length > LIMITS.email.max) errors.email = "Please enter a valid email address.";

  if (!input.subject) errors.subject = "Please tell us what this is about.";
  else if (input.subject.length > LIMITS.subject.max) errors.subject = `Please keep the subject under ${LIMITS.subject.max} characters.`;

  if (input.message.length < LIMITS.message.min) errors.message = `Please write at least ${LIMITS.message.min} characters.`;
  else if (input.message.length > LIMITS.message.max) errors.message = `Please keep your message under ${LIMITS.message.max} characters.`;
  else if ((input.message.match(/https?:\/\//gi) ?? []).length > MAX_LINKS) errors.message = `Please include no more than ${MAX_LINKS} links.`;

  return errors;
}

/* ---------- Spam guard: signed "form issued at" token ----------
   The page embeds `<issuedAt>.<hmac>`. A submission must carry a valid,
   unexpired token that is at least MIN_FILL_MS old, so bots can't post
   without loading the page and can't submit instantly. */

const sign = (secret: string, issuedAt: string) => createHmac("sha256", secret).update(`contact:${issuedAt}`).digest("base64url");

export function issueToken(secret: string, now = Date.now()): string {
  const issuedAt = String(now);
  return `${issuedAt}.${sign(secret, issuedAt)}`;
}

export type TokenCheck = "ok" | "invalid" | "too-fast" | "expired";

export function checkToken(secret: string, token: unknown, now = Date.now()): TokenCheck {
  if (typeof token !== "string") return "invalid";
  const [issuedAt, mac] = token.split(".");
  if (!issuedAt || !mac || !/^\d{10,16}$/.test(issuedAt)) return "invalid";
  const expected = Buffer.from(sign(secret, issuedAt));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  const age = now - Number(issuedAt);
  if (age < MIN_FILL_MS) return "too-fast";
  if (age > MAX_TOKEN_AGE_MS) return "expired";
  return "ok";
}

/* ---------- Email ---------- */

export type ContactConfig = { apiKey: string; to: string; from: string; apiBase?: string };

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function buildEmail(input: ContactInput, config: ContactConfig) {
  const subject = `Website contact: ${input.subject}`.replace(/[\r\n]+/g, " ").slice(0, 200);
  const text = `Name: ${input.name}\nEmail: ${input.email}\nSubject: ${input.subject}\n\n${input.message}\n`;
  const html =
    `<p><strong>Name:</strong> ${escapeHtml(input.name)}<br><strong>Email:</strong> ${escapeHtml(input.email)}<br>` +
    `<strong>Subject:</strong> ${escapeHtml(input.subject)}</p>` +
    `<p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`;
  return { from: config.from, to: [config.to], reply_to: input.email, subject, text, html };
}

export type SendResult = { ok: true; id: string } | { ok: false; status: number; message: string };

/** Friendly, non-leaky message for each Resend failure class. */
export function describeFailure(status: number): string {
  if (status === 429) return "We're getting a lot of messages right now. Please try again in a minute.";
  if (status === 422) return "Something in your message couldn't be sent. Please check it and try again.";
  return "Sorry, your message couldn't be sent right now. Please try again later.";
}

export async function sendContactEmail(
  input: ContactInput,
  config: ContactConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<SendResult> {
  const body = buildEmail(input, config);
  // Same content within Resend's 24 h window is delivered once (guards double submits).
  const idempotencyKey = createHash("sha256").update(`${input.email}\n${input.subject}\n${input.message}`).digest("hex");
  try {
    const res = await fetchImpl(`${config.apiBase ?? "https://api.resend.com"}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; name?: string; message?: string };
    if (res.ok && data.id) return { ok: true, id: data.id };
    return { ok: false, status: res.status, message: data.message ?? data.name ?? res.statusText };
  } catch (err) {
    return { ok: false, status: 0, message: err instanceof Error ? err.message : String(err) };
  }
}

export const CONTACT_ENV = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"] as const;

/** Names (never values) of the required env vars that are unset or blank. */
export function missingContactEnv(env: Record<string, string | undefined> = process.env): string[] {
  return CONTACT_ENV.filter((k) => !env[k]?.trim());
}

/** Reads the form's server config from env; null means the form isn't set up yet. */
export function configFromEnv(env: Record<string, string | undefined> = process.env): ContactConfig | null {
  if (missingContactEnv(env).length) return null;
  return { apiKey: env.RESEND_API_KEY!.trim(), to: env.CONTACT_TO_EMAIL!.trim(), from: env.CONTACT_FROM_EMAIL!.trim() };
}
