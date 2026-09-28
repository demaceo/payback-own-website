import { type NextRequest, NextResponse } from "next/server";
import { STORE_LINKS } from "@/lib/site";

/**
 * Smart download link (the QR code target). Sends phones to their store and
 * everyone else, or any platform without a live listing, to the on-page badges.
 */
export function GET(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  const store = /iPhone|iPad|iPod/i.test(ua) ? STORE_LINKS.ios : /Android/i.test(ua) ? STORE_LINKS.android : null;

  const res = NextResponse.redirect(store ?? new URL("/#get", request.url), 307);
  // The response depends on the device, so shared caches must not reuse it across user agents.
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("Vary", "User-Agent");
  return res;
}
