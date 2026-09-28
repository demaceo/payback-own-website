import { PHONE_ROWS } from "@/lib/site";
import { Icon } from "./Icon";

const WAVES = [
  { y: 320, w: 1.4, o: 0.55 },
  { y: 360, w: 1.2, o: 0.45 },
  { y: 400, w: 1.1, o: 0.34 },
  { y: 440, w: 1, o: 0.24 },
  { y: 280, w: 1.2, o: 0.42 },
  { y: 240, w: 1.1, o: 0.3 },
  { y: 200, w: 1, o: 0.2 },
];

/** Built-in-code phone render of the app home screen. Purely illustrative, so hidden from AT. */
export function PhoneMockup() {
  return (
    <div className="phone-stage" aria-hidden="true">
      <svg className="waves" viewBox="0 0 640 620" fill="none">
        <g stroke="#4F7BFF" fill="none">
          {WAVES.map(({ y, w, o }) => (
            <path
              key={y}
              d={`M-40 ${y}C80 ${y - 160} 220 ${y + 180} 340 ${y + 20}S560 ${y - 190} 680 ${y - 70}`}
              strokeWidth={w}
              opacity={o}
            />
          ))}
        </g>
      </svg>
      <div className="phone">
        <div className="notch" />
        <div className="screen">
          <div className="st-bar">
            <span>9:41</span>
            <span>&#9679;&#9679;&#9679;&nbsp;&#9679;</span>
          </div>
          <div className="ph-head">
            <span className="lg">
              <svg focusable="false">
                <use href="#i-mark" />
              </svg>
              PAYBACK
            </span>
            <span className="burger">
              <i />
              <i />
              <i />
            </span>
          </div>
          <p className="ctrl">You&apos;re in control.</p>
          <div className="gauge">
            <svg viewBox="0 0 200 118">
              <defs>
                <linearGradient id="gg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6C3BFF" />
                  <stop offset=".55" stopColor="#5B5BF6" />
                  <stop offset="1" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
              <path d="M14 112a86 86 0 0 1 172 0" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="14" strokeLinecap="round" />
              <path
                id="arc"
                d="M14 112a86 86 0 0 1 172 0"
                fill="none"
                stroke="url(#gg)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="271"
                strokeDashoffset="271"
              />
            </svg>
            <div className="gnum" id="pct">
              100%
            </div>
          </div>
          <p className="gauge-cap">Your Data. Your Choice. Your Value.</p>
          <div className="rows">
            {PHONE_ROWS.map(({ icon, tone, title, sub, chevron }) => (
              <div className="row" key={title}>
                <span className={`ic pi-${tone}`}>
                  <Icon name={icon} />
                </span>
                <span>
                  <b>{title}</b>
                  <span className="sub">{sub}</span>
                </span>
                {chevron && (
                  <span className="chev">
                    <Icon name="chevron" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
