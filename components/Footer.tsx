import Link from "next/link";
import { CONTACT_PATH, SOCIAL } from "@/lib/site";
import { Icon } from "./Icon";

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <div>
          <Link className="logo" href="/#top" aria-label="Payback home">
            <svg className="logo-lockup" aria-hidden="true" focusable="false">
              <use href="#i-lockup" />
            </svg>
          </Link>
          <p className="copy">
            © {new Date().getFullYear()} Payback Digital, Inc. All rights reserved. ·{" "}
            <Link className="foot-link" href={CONTACT_PATH}>
              Contact
            </Link>
          </p>
        </div>
        <div className="social">
          {SOCIAL.map(({ label, href, icon }) => (
            <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
              <Icon name={icon} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
