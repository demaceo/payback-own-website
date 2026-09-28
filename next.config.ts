import { randomBytes } from "node:crypto";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Inlined at build time, so every function in one deployment shares it. Only read
  // from server-only code (lib/contact-secret.ts); CONTACT_TOKEN_SECRET overrides it.
  env: { CONTACT_TOKEN_BUILD_SECRET: randomBytes(32).toString("hex") },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
