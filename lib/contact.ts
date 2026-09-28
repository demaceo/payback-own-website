/* ============================================================
   Contact form core: validation, spam guards and the HubSpot call.
   Framework-free so it can be unit-tested with plain Node.
   ============================================================ */

import { createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { INTERESTS, LIMITS, TEXT_FIELDS, type ContactField, type ContactInput, type Interest } from "./contact-fields.ts";

export * from "./contact-fields.ts";

const MIN_FILL_MS = 3_000; // humans don't finish the form in under 3 s
const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_LINKS = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s.-]{7,30}$/;
const INTEREST_VALUES = new Set<string>(INTERESTS.map((i) => i.value));

/* ---------- Validation ---------- */

export function readInput(get: (key: string) => unknown, getAll: (key: string) => unknown[] = () => []): ContactInput {
  const str = (k: string) => (typeof get(k) === "string" ? (get(k) as string).trim() : "");
  const text = Object.fromEntries(TEXT_FIELDS.map((f) => [f, str(f)])) as Record<(typeof TEXT_FIELDS)[number], string>;
  // Only known options survive, de-duplicated, in the form's display order.
  const picked = new Set(getAll("interests").filter((v): v is string => typeof v === "string"));
  const interests = INTERESTS.map((i) => i.value).filter((v) => picked.has(v)) as Interest[];
  return { ...text, interests };
}

export function validate(input: ContactInput): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  const lengthOk = (f: keyof typeof LIMITS) => input[f].length <= LIMITS[f].max;

  if (!input.firstname) errors.firstname = "Please enter your first name.";
  else if (!lengthOk("firstname")) errors.firstname = `Please keep this under ${LIMITS.firstname.max} characters.`;

  if (!input.lastname) errors.lastname = "Please enter your last name.";
  else if (!lengthOk("lastname")) errors.lastname = `Please keep this under ${LIMITS.lastname.max} characters.`;

  if (!EMAIL_RE.test(input.email) || !lengthOk("email")) errors.email = "Please enter a valid email address.";

  if (input.phone && !PHONE_RE.test(input.phone)) errors.phone = "Please enter a valid phone number, or leave it blank.";

  if (input.message.length < LIMITS.message.min) errors.message = `Please write at least ${LIMITS.message.min} characters.`;
  else if (!lengthOk("message")) errors.message = `Please keep your message under ${LIMITS.message.max} characters.`;
  else if ((input.message.match(/https?:\/\//gi) ?? []).length > MAX_LINKS) errors.message = `Please include no more than ${MAX_LINKS} links.`;

  if (input.interests.some((v) => !INTEREST_VALUES.has(v))) errors.interests = "Please choose from the listed options.";

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

/* ---------- HubSpot ----------
   Forms API v3 (unauthenticated): POST /submissions/v3/integration/submit/{portalId}/{formGuid}
   Docs: developers.hubspot.com/docs/api-reference/legacy/marketing/forms/v3-legacy/submit-data-unauthenticated
   The endpoint does little validation of its own, so everything above runs first. */

export type HubSpotTarget = { portalId: string; formGuid: string; apiBase?: string };
export type SubmitContext = { pageUri: string; pageName: string; hutk?: string | null; ipAddress?: string | null };

export function buildHubSpotPayload(input: ContactInput, ctx: SubmitContext, now = Date.now()) {
  const field = (name: string, value: string) => ({ objectTypeId: "0-1", name, value });
  const fields = [
    field("firstname", input.firstname),
    field("lastname", input.lastname),
    field("email", input.email),
    field("message", input.message),
    // Optional fields are omitted when empty so they never blank out an existing contact's values.
    ...(input.phone ? [field("phone", input.phone)] : []),
    ...(input.interests.length ? [field("choose_your_role", input.interests.join(";"))] : []),
  ];
  const context: Record<string, string> = { pageUri: ctx.pageUri, pageName: ctx.pageName };
  // HubSpot rejects malformed values (INVALID_HUTK / INVALID_IP_ADDRESS), so only pass clean ones.
  if (ctx.hutk && /^[a-f0-9]{32}$/i.test(ctx.hutk)) context.hutk = ctx.hutk;
  if (ctx.ipAddress && isIP(ctx.ipAddress)) context.ipAddress = ctx.ipAddress;
  return { submittedAt: String(now), fields, context };
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; status: number; errorTypes: string[]; message: string };

export async function submitToHubSpot(
  input: ContactInput,
  ctx: SubmitContext,
  target: HubSpotTarget,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  const url = `${target.apiBase ?? "https://api.hsforms.com"}/submissions/v3/integration/submit/${target.portalId}/${target.formGuid}`;
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildHubSpotPayload(input, ctx)),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => ({}))) as { message?: string; errors?: { errorType?: string; message?: string }[] };
    const errorTypes = (data.errors ?? []).map((e) => e.errorType ?? "UNKNOWN");
    return { ok: false, status: res.status, errorTypes, message: data.message ?? res.statusText };
  } catch (err) {
    return { ok: false, status: 0, errorTypes: [], message: err instanceof Error ? err.message : String(err) };
  }
}

/** Visitor-facing outcome for a failed submission; field errors land on the relevant input. */
export function describeFailure(result: Extract<SubmitResult, { ok: false }>): {
  message: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
} {
  if (result.errorTypes.some((t) => t === "INVALID_EMAIL" || t === "BLOCKED_EMAIL")) {
    return { message: "Please fix the highlighted fields.", fieldErrors: { email: "Please use a different email address." } };
  }
  if (result.errorTypes.includes("INVALID_NUMBER")) {
    return { message: "Please fix the highlighted fields.", fieldErrors: { phone: "Please enter a valid phone number, or leave it blank." } };
  }
  if (result.status === 429) return { message: "We're getting a lot of messages right now. Please try again in a minute." };
  return { message: "Sorry, your message couldn't be sent right now. Please try again later." };
}

/** First client IP from Vercel's forwarding headers. */
export function clientIp(get: (name: string) => string | null): string | null {
  const ip = get("x-real-ip") ?? get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  return ip && isIP(ip) ? ip : null;
}
