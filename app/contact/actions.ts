"use server";

import { cookies, headers } from "next/headers";
import { contactTokenSecret } from "@/lib/contact-secret";
import { checkToken, clientIp, describeFailure, readInput, submitToHubSpot, validate, type ContactState } from "@/lib/contact";
import { CONTACT_PATH, HUBSPOT_FORM, SITE_URL } from "@/lib/site";

const SUCCESS: ContactState = {
  status: "success",
  message: "Thanks, we've got your message. The Payback team will be in touch soon.",
};

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Bots fill every field; the honeypot is visually hidden from people. Pretend it worked.
  if (formData.get("website")) return SUCCESS;

  const token = checkToken(contactTokenSecret(), formData.get("token"));
  if (token === "too-fast") return SUCCESS;
  if (token !== "ok") {
    return { status: "error", message: "This form has expired. Please reload the page and try again." };
  }

  const values = readInput((k) => formData.get(k), (k) => formData.getAll(k));
  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const [h, c] = await Promise.all([headers(), cookies()]);
  const result = await submitToHubSpot(
    values,
    {
      pageUri: `${SITE_URL}${CONTACT_PATH}`,
      pageName: "Contact · Payback",
      hutk: c.get("hubspotutk")?.value, // present only if HubSpot tracking has run for this visitor
      ipAddress: clientIp((n) => h.get(n)),
    },
    // HUBSPOT_API_BASE lets local end-to-end tests point at a mock server; unset in production.
    { ...HUBSPOT_FORM, apiBase: process.env.HUBSPOT_API_BASE || undefined },
  );
  if (!result.ok) {
    // Error types and HubSpot's message only; never the visitor's field values.
    console.error(`[contact] HubSpot error ${result.status}: ${result.errorTypes.join(",") || "-"} ${result.message}`);
    return { status: "error", ...describeFailure(result), values };
  }
  return SUCCESS;
}
