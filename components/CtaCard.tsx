import { Icon } from "./Icon";
import { QrCode } from "./QrCode";
import { StoreBadges } from "./StoreBadges";

export function CtaCard() {
  return (
    <div className="cta-card rv">
      <div>
        <p className="cta-kick">Free to download. Better than free, because Payback pays you.</p>
        <h3>Take Ownership Today.</h3>
        <p>Start your Ownership Journey and get paid for what was always yours.</p>
        <p className="cta-note">
          <Icon name="message" /> <span>Open beta. Your feedback decides what we build next.</span>
        </p>
      </div>
      <StoreBadges className="cta-stores" />
      <QrCode />
    </div>
  );
}
