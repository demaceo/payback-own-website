import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { SiteShell } from "@/components/SiteShell";
import { issueToken } from "@/lib/contact";
import { contactTokenSecret } from "@/lib/contact-secret";
import { CONTACT_PATH } from "@/lib/site";

// Rendered per request so every visitor gets a freshly signed anti-spam token.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact · Payback",
  description: "Get in touch with the Payback team or book a demo.",
  alternates: { canonical: CONTACT_PATH },
};

const POINTS = [
  { icon: "message", title: "Effortless assistance", body: "Connect with our team anytime." },
  { icon: "users", title: "Book a demo", body: "Experience the platform in action." },
] as const;

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="hero contact" aria-labelledby="contact-title">
        <div className="hero-bg" />
        <div className="wrap contact-grid">
          <div>
            <p className="eyebrow">Get in touch</p>
            <h1 id="contact-title">
              Talk to <span className="accent">Payback.</span>
            </h1>
            <p className="lede">Questions, partnerships, press or a demo. Send us a note and a real person will reply.</p>
            <div className="pillars">
              {POINTS.map(({ icon, title, body }) => (
                <div className="pillar" key={title}>
                  <span className="pill-icon pi-violet">
                    <Icon name={icon} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="cta-card contact-card">
            <ContactForm token={issueToken(contactTokenSecret())} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
