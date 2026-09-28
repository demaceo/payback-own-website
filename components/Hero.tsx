import { PILLARS } from "@/lib/site";
import { Icon } from "./Icon";
import { PhoneMockup } from "./PhoneMockup";
import { StoreBadges } from "./StoreBadges";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" />
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">The Ownership Journey Begins Today</p>
          <h1>
            Own Your
            <br />
            Individual Data.
            <br />
            <span className="accent">Change the Internet.</span>
          </h1>
          <p className="lede">You created the data. For too long, others profited from it. Payback puts you back in control.</p>

          <div className="pillars">
            {PILLARS.map(({ icon, tone, title, body }) => (
              <div className="pillar" key={title}>
                <span className={`pill-icon pi-${tone}`}>
                  <Icon name={icon} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>

          <StoreBadges className="stores" id="get" />
          <p className="beta">
            <Icon name="message" />{" "}
            <span>
              <b>Now in open beta.</b> Every download makes it better. Tell us what to fix and we’ll build it.
            </span>
          </p>
        </div>

        <PhoneMockup />
      </div>
    </section>
  );
}
