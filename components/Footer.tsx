import { SOCIAL } from "@/lib/site";
import { Icon } from "./Icon";

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <div>
          <a className="logo" href="#top" aria-label="Back to top">
            <svg className="logo-lockup" aria-hidden="true" focusable="false">
              <use href="#i-lockup" />
            </svg>
          </a>
          <p className="copy">© {new Date().getFullYear()} Payback Digital, Inc. All rights reserved.</p>
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
