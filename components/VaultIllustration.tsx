/** Placeholder vault illustration. Swap for the 3D vault render when it's ready. */
export function VaultIllustration() {
  return (
    <svg className="vault" viewBox="0 0 200 182" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="vTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9A93FF" />
          <stop offset="1" stopColor="#6F66F0" />
        </linearGradient>
        <linearGradient id="vL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6259E8" />
          <stop offset="1" stopColor="#413AC0" />
        </linearGradient>
        <linearGradient id="vR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#544CD8" />
          <stop offset="1" stopColor="#332CA0" />
        </linearGradient>
      </defs>
      <path d="M100 8 174 46v90l-74 38-74-38V46z" fill="url(#vTop)" />
      <path d="M100 8 174 46l-74 38-74-38z" fill="#A9A2FF" />
      <path d="M100 84v90l-74-38V46z" fill="url(#vL)" />
      <path d="M100 84v90l74-38V46z" fill="url(#vR)" />
      <g opacity=".22" fill="#fff">
        <path d="M100 84v90l-74-38V46z" />
      </g>
      <circle cx="63" cy="122" r="23" fill="rgba(255,255,255,.15)" />
      <path d="M55 119v-6a8 8 0 0 1 16 0v6" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
      <rect x="52" y="119" width="22" height="17" rx="4.5" fill="#fff" />
      <path
        d="M137 100l17 7.5v15c0 11-7.5 18.5-17 22.5-9.5-4-17-11.5-17-22.5v-15z"
        fill="rgba(255,255,255,.16)"
        stroke="#fff"
        strokeWidth="3"
      />
      <path d="M137 111v19M130 118h14" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
