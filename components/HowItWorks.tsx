import type { ReactNode } from "react";
import { CAMPS } from "@/lib/site";
import { CtaCard } from "./CtaCard";
import { Icon } from "./Icon";
import { VaultIllustration } from "./VaultIllustration";

function Step({ n, title, body, bodyClass, children }: { n: number; title: string; body: string; bodyClass?: string; children: ReactNode }) {
  return (
    <div className="step rv">
      <div className="step-h">
        <span className="num" aria-hidden="true">
          {n}
        </span>
        <h3>
          <span className="sr-only">Step {n}: </span>
          {title}
        </h3>
      </div>
      <p>{body}</p>
      <div className={bodyClass ? `step-body ${bodyClass}` : "step-body"}>{children}</div>
    </div>
  );
}

const Arrow = () => (
  <div className="arrow" aria-hidden="true">
    <Icon name="chevron" style={{ strokeWidth: 1.6 }} />
  </div>
);

export function HowItWorks() {
  return (
    <section className="light" aria-labelledby="how-title">
      <div className="wrap">
        <p className="kicker tc rv">How Payback Own Works</p>
        <h2 className="rv" id="how-title">
          Your Data. Your Vault. Your Value.
        </h2>

        <div className="steps">
          <Step n={1} title="Retrieve" body="Request your data from the data collectors who know you.">
            <div className="sources" aria-hidden="true">
              <span className="src" style={{ color: "#4285F4" }} aria-hidden="true">
                G
              </span>
              <span className="src" style={{ color: "#0866FF", fontSize: 26 }} aria-hidden="true">
                &infin;
              </span>
              <span className="src" style={{ color: "#111" }} aria-hidden="true">
                <Icon name="apple" style={{ width: 24, height: 24 }} />
              </span>
              <span className="src plus" aria-hidden="true">
                +
              </span>
            </div>
            <p className="src-note">More sources coming soon.</p>
          </Step>

          <Arrow />

          <Step n={2} title="Process on Device" body="Your data runs through CAMPS on your phone. Payback never receives it.">
            <div className="camps">
              {CAMPS.map(({ icon, label }) => (
                <div className="camp" key={label}>
                  <div className="bx">
                    <Icon name={icon} style={{ strokeWidth: 1.8 }} />
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </Step>

          <Arrow />

          <Step n={3} title="You Own" body="Everything is stored in your Individual Data Vault. It never leaves." bodyClass="vault-wrap">
            <VaultIllustration />
          </Step>
        </div>

        <p className="no-one rv">
          <span className="badge">
            <Icon name="user-check" style={{ strokeWidth: 2.4 }} />
          </span>
          No one sees it. No one touches it. It grows with you for life.
        </p>

        <CtaCard />
      </div>
    </section>
  );
}
