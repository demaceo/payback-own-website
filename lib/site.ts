/* ============================================================
   Site configuration: the one place to edit links and copy lists.
   ============================================================ */

export type Platform = "ios" | "android";
export type IconName =
  | "lock" | "message" | "youtube" | "dollar" | "shield-check" | "shield" | "chevron"
  | "play" | "user" | "user-check" | "users" | "download" | "search" | "merge" | "trash"
  | "x" | "linkedin" | "instagram" | "facebook" | "apple" | "play-store";

/** App download URLs. Set one to null while a listing is unavailable; its badges then link to #get. */
export const STORE_LINKS: Record<Platform, string | null> = {
  // Region-neutral: Apple forwards each visitor to their own storefront.
  ios: "https://apps.apple.com/app/id6754859483",
  android: "https://play.google.com/store/apps/details?id=com.milehighinterface.payback",
};

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL once a custom domain is attached;
 * on Vercel it otherwise falls back to the project's production domain.
 */
export const SITE_URL = (() => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
})();

/** Contact page (same path the previous Framer site used, so old links keep working). */
export const CONTACT_PATH = "/contact";

/** Short link encoded in the QR code; redirects to the right store by device. */
export const DOWNLOAD_PATH = "/download";

export const SITE = {
  name: "Payback",
  title: "Payback: Own Your Individual Data. Change the Internet.",
  description:
    "You created the data. For too long, others profited from it. Payback puts you back in control. Now in open beta on iOS and Android.",
};

export const STORES: { platform: Platform; label: string; kicker: string; title: string; icon: IconName }[] = [
  { platform: "ios", label: "Download on the App Store", kicker: "Download on the", title: "App Store", icon: "apple" },
  { platform: "android", label: "Get it on Google Play", kicker: "GET IT ON", title: "Google Play", icon: "play-store" },
];

export const PILLARS: { icon: IconName; tone: "violet" | "green"; title: string; body: string }[] = [
  {
    icon: "lock",
    tone: "violet",
    title: "Own Your Data",
    body: "Retrieve your data from data collectors, combine it, and keep it in your private vault.",
  },
  { icon: "dollar", tone: "green", title: "Get Paid for Invitations", body: "Choose who can reach you. Get paid when you engage." },
];

export const PHONE_ROWS: { icon: IconName; tone: "violet" | "green"; title: string; sub: string; chevron: boolean }[] = [
  { icon: "shield-check", tone: "violet", title: "My Data Vault", sub: "Your data is private. It never leaves your vault.", chevron: true },
  { icon: "dollar", tone: "green", title: "Invitations", sub: "You choose who can reach you and get paid.", chevron: true },
  { icon: "play", tone: "violet", title: "Media", sub: "Ad-free and tracking-free. Coming next.", chevron: false },
];

export const CAMPS: { icon: IconName; label: string }[] = [
  { icon: "download", label: "Collect" },
  { icon: "search", label: "Analyze" },
  { icon: "merge", label: "Merge" },
  { icon: "trash", label: "Purge" },
  { icon: "lock", label: "Store" },
];

export const VALUES: { icon: IconName; color: string; title: string; body: string }[] = [
  { icon: "lock", color: "#7C74FF", title: "100% Private", body: "Your data never leaves your vault." },
  { icon: "shield", color: "#7C74FF", title: "You Decide", body: "You choose who to engage with." },
  { icon: "dollar", color: "#22C55E", title: "You Get Paid", body: "Your data and attention have value." },
  { icon: "users", color: "#7C74FF", title: "Built for You", body: "A better internet starts with ownership." },
];

export const SOCIAL: { label: string; href: string; icon: IconName }[] = [
  { label: "X", href: "https://x.com/Payback_Digital", icon: "x" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/paybackdigital", icon: "linkedin" },
  { label: "Instagram", href: "https://www.instagram.com/payback.digital", icon: "instagram" },
  { label: "YouTube", href: "https://www.youtube.com/@PaybackDigital", icon: "youtube" },
];
