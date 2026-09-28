/* Contact form fields and limits, shared by the browser form and the server.
   Keep this file free of Node-only imports: it ships to the client. */

export const CONTACT_FIELDS = ["name", "email", "subject", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactInput = Record<ContactField, string>;

export const LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 3, max: 254 },
  subject: { min: 1, max: 150 },
  message: { min: 10, max: 5000 },
} as const satisfies Record<ContactField, { min: number; max: number }>;

export type ContactState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<ContactField, string>>; values?: ContactInput };
