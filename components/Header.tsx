import { Icon } from "./Icon";

export function Header() {
  return (
    <>
      <div id="ph-bar">
        👋 Hey Product Hunt. Thanks for stopping by. <a href="#get">Grab the beta&nbsp;→</a>
      </div>
      <header id="hdr">
        <div className="wrap hdr">
          <a className="logo" href="#top" aria-label="Payback home">
            <svg className="logo-lockup" aria-hidden="true" focusable="false">
              <use href="#i-lockup" />
            </svg>
          </a>
          <a className="btn btn-primary" id="hdr-cta" href="#get">
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
