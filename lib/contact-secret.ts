import "server-only";

/**
 * Secret for signing contact-form tokens. Uses CONTACT_TOKEN_SECRET when set;
 * otherwise a random value generated once per build (see next.config.ts), so
 * there is nothing to configure. Server-only: never export this from a
 * "use server" file.
 */
export function contactTokenSecret(): string {
  const secret = process.env.CONTACT_TOKEN_SECRET?.trim() || process.env.CONTACT_TOKEN_BUILD_SECRET;
  if (!secret) throw new Error("contact token secret unavailable");
  return secret;
}
