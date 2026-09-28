import Link from "next/link";
import { Icon } from "./Icon";

export function Header() {
  return (
    <>
      <div id="ph-bar">
        👋 Hey Product Hunt. Thanks for stopping by. <Link href="/#get">Grab the beta&nbsp;→</Link>
      </div>
      <header id="hdr">
        <div className="wrap hdr">
          <Link className="logo" href="/#top" aria-label="Payback home">
            <svg className="logo-lockup" aria-hidden="true" focusable="false">
              <use href="#i-lockup" />
            </svg>
          </Link>
          {/* Plain <a> on purpose: PageEffects swaps this href to the visitor's app store at runtime,
              and <Link> would ignore that and navigate to its original prop. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn-primary" id="hdr-cta" href="/#get">
            <Icon name="download" style={{ fontSize: 16, strokeWidth: 2.4 }} />
            <span id="hdr-cta-label">
              <span className="cta-long">Download Payback</span>
              <span className="cta-short">Download</span>
            </span>
          </a>
        </div>
      </header>
    </>
  );
}
