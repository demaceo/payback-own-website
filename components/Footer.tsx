import Link from "next/link";
import { HomeAnchor } from "./HomeAnchor";
import { CONTACT_PATH, SOCIAL } from "@/lib/site";
import { Icon } from "./Icon";

export function Footer({ home }: { home: boolean }) {
  return (
    <footer>
      <div className="wrap foot">
        <div>
          <HomeAnchor home={home} hash="top" className="logo" aria-label="Payback home">
            <svg className="logo-lockup" aria-hidden="true" focusable="false">
              <use href="#i-lockup" />
            </svg>
          </HomeAnchor>
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
