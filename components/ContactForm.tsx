"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact } from "@/app/contact/actions";
import { INTERESTS, LIMITS, TEXT_FIELDS, type ContactState, type TextField } from "@/lib/contact-fields";

type FieldDef = { name: TextField; label: string; type?: string; autoComplete?: string; placeholder: string; optional?: boolean; full?: boolean };

const FIELDS: FieldDef[] = [
  { name: "firstname", label: "First name", autoComplete: "given-name", placeholder: "Jane" },
  { name: "lastname", label: "Last name", autoComplete: "family-name", placeholder: "Smith" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "jane@example.com" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "(000) 000-0000", optional: true },
];

export function ContactForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? state.values : undefined;

  // Move focus to the first invalid field so keyboard and screen-reader users land on the problem.
  useEffect(() => {
    const first = [...TEXT_FIELDS, "interests"].find((f) => errors[f as keyof typeof errors]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.status === "success") {
    return (
      <p className="form-status ok" role="status">
        {state.message}
      </p>
    );
  }

  const input = ({ name, label, type = "text", autoComplete, placeholder, optional }: FieldDef) => {
    const err = errors[name];
    return (
      <div className="field" key={name}>
        <label htmlFor={`f-${name}`}>
          {label}
          {optional && <span className="opt"> (optional)</span>}
        </label>
        <input
          id={`f-${name}`}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={!optional}
          maxLength={LIMITS[name].max}
          defaultValue={values?.[name]}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `f-${name}-err` : undefined}
        />
        {err && (
          <p className="field-err" id={`f-${name}-err`}>
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <form ref={formRef} action={action} className="contact-form" aria-describedby="form-status">
      {FIELDS.map(input)}

      <fieldset className="field full interests" aria-describedby={errors.interests ? "f-interests-err" : undefined}>
        <legend>
          I&apos;m interested in<span className="opt"> (optional)</span>
        </legend>
        <div className="checks">
          {INTERESTS.map(({ value, label }) => (
            <label className="check" key={value}>
              <input type="checkbox" name="interests" value={value} defaultChecked={values?.interests.includes(value)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {errors.interests && (
          <p className="field-err" id="f-interests-err">
            {errors.interests}
          </p>
        )}
      </fieldset>

      <div className="field full">
        <label htmlFor="f-message">Message</label>
        <textarea
          id="f-message"
          name="message"
          rows={6}
          placeholder="How can we help?"
          required
          minLength={LIMITS.message.min}
          maxLength={LIMITS.message.max}
          defaultValue={values?.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "f-message-err" : undefined}
        />
        {errors.message && (
          <p className="field-err" id="f-message-err">
            {errors.message}
          </p>
        )}
      </div>

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
