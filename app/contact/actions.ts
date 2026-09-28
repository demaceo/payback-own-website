"use server";

import { contactTokenSecret } from "@/lib/contact-secret";
import {
  checkToken,
  configFromEnv,
  missingContactEnv,
  describeFailure,
  readInput,
  sendContactEmail,
  validate,
  type ContactState,
} from "@/lib/contact";

const SUCCESS: ContactState = { status: "success", message: "Thanks, your message is on its way. We'll get back to you soon." };

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Bots fill every field; the honeypot is visually hidden from people. Pretend it worked.
  if (formData.get("website")) return SUCCESS;

  const token = checkToken(contactTokenSecret(), formData.get("token"));
  if (token === "too-fast") return SUCCESS;
  if (token !== "ok") {
    return { status: "error", message: "This form has expired. Please reload the page and try again." };
  }

  const values = readInput((k) => formData.get(k));
  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const config = configFromEnv();
  if (!config) {
    console.error(`[contact] missing env: ${missingContactEnv().join(", ")}`);
    return { status: "error", message: "The contact form isn't available right now. Please try again later.", values };
  }

  const result = await sendContactEmail(values, config);
  if (!result.ok) {
    console.error(`[contact] Resend error ${result.status}: ${result.message}`);
    return { status: "error", message: describeFailure(result.status), values };
  }
  return SUCCESS;
}
