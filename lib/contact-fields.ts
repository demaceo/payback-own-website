/* Contact form fields and limits, shared by the browser form and the server.
   Keep this file free of Node-only imports: it ships to the client.
   Field names match the HubSpot form the previous site submitted to. */

export const TEXT_FIELDS = ["firstname", "lastname", "email", "phone", "message"] as const;
export type TextField = (typeof TEXT_FIELDS)[number];

/** "I'm interested in" checkboxes; `value` is the HubSpot option's internal value. */
export const INTERESTS = [
  { value: "own_my_individual_data", label: "Own my individual data" },
  { value: "send_invitations", label: "Send invitations" },
  { value: "create_on_payback_media", label: "Create on Payback Media" },
  { value: "learn_about_payback_give", label: "Learn about Payback Give" },
] as const;
export type Interest = (typeof INTERESTS)[number]["value"];

export type ContactInput = Record<TextField, string> & { interests: Interest[] };
export type ContactField = TextField | "interests";

export const LIMITS = {
  firstname: { min: 1, max: 60 },
  lastname: { min: 1, max: 60 },
  email: { min: 3, max: 254 },
  phone: { min: 0, max: 30 }, // optional
  message: { min: 10, max: 5000 },
} as const satisfies Record<TextField, { min: number; max: number }>;

export type ContactState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<ContactField, string>>; values?: ContactInput };
