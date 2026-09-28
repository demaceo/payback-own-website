import { HomeAnchor } from "./HomeAnchor";
import { Icon } from "./Icon";

export function Header({ home }: { home: boolean }) {
  return (
    <>
      <div id="ph-bar">
        👋 Hey Product Hunt. Thanks for stopping by. <HomeAnchor home={home} hash="get">
          Grab the beta&nbsp;→
        </HomeAnchor>
      </div>
      <header id="hdr">
        <div className="wrap hdr">
          <HomeAnchor home={home} hash="top" className="logo" aria-label="Payback home">
            <svg className="logo-lockup" aria-hidden="true" focusable="false">
              <use href="#i-lockup" />
            </svg>
          </HomeAnchor>
          {/* Plain <a> on purpose: PageEffects swaps this href to the visitor's app store at runtime,
              and <Link> would ignore that and navigate to its original prop. */}
          <a className="btn btn-primary" id="hdr-cta" href={home ? "#get" : "/#get"}>
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
