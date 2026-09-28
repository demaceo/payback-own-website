"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact } from "@/app/contact/actions";
import { CONTACT_FIELDS, LIMITS, type ContactField, type ContactState } from "@/lib/contact-fields";

const FIELDS: { name: ContactField; label: string; type?: string; autoComplete?: string; placeholder: string; multiline?: boolean }[] = [
  { name: "name", label: "Name", autoComplete: "name", placeholder: "Jane Smith" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "jane@example.com" },
  { name: "subject", label: "Subject of interest", placeholder: "Partnership, demo, press…" },
  { name: "message", label: "Message", placeholder: "How can we help?", multiline: true },
];

export function ContactForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? state.values : undefined;

  // Move focus to the first invalid field so keyboard and screen-reader users land on the problem.
  useEffect(() => {
    const first = CONTACT_FIELDS.find((f) => errors[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.status === "success") {
    return (
      <p className="form-status ok" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form ref={formRef} action={action} className="contact-form" aria-describedby="form-status">
      {FIELDS.map(({ name, label, type = "text", autoComplete, placeholder, multiline }) => {
        const err = errors[name];
        const shared = {
          id: `f-${name}`,
          name,
          placeholder,
          autoComplete,
          required: true,
          minLength: LIMITS[name].min,
          maxLength: LIMITS[name].max,
          defaultValue: values?.[name],
          "aria-invalid": err ? true : undefined,
          "aria-describedby": err ? `f-${name}-err` : undefined,
        };
        return (
          <div className={`field${multiline ? " full" : ""}`} key={name}>
            <label htmlFor={`f-${name}`}>{label}</label>
            {multiline ? <textarea rows={6} {...shared} /> : <input type={type} {...shared} />}
            {err && (
              <p className="field-err" id={`f-${name}-err`}>
                {err}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="token" value={token} />

      <div className="form-foot full">
        <p id="form-status" className={`form-status${state.status === "error" ? " err" : ""}`} aria-live="polite">
          {state.status === "error" ? state.message : ""}
        </p>
        <button className="btn btn-primary" type="submit" disabled={pending} aria-disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
