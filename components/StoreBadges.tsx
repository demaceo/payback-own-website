import { STORE_LINKS, STORES } from "@/lib/site";
import { Icon } from "./Icon";

type Props = { className: string; id?: string };

/** App Store + Google Play badges. Used in the hero and the closing CTA card. */
export function StoreBadges({ className, id }: Props) {
  return (
    <div className={className} id={id}>
      {STORES.map(({ platform, label, kicker, title, icon }) => {
        const href = STORE_LINKS[platform];
        return (
          <a
            key={platform}
            className="store"
            data-store={platform}
            href={href ?? "#get"}
            aria-label={label}
            {...(href && { target: "_blank", rel: "noopener noreferrer" })}
          >
            <Icon name={icon} className="glyph" style={platform === "ios" ? { color: "#fff" } : undefined} />
            <span className="st">
              <small>{kicker}</small>
              <b>{title}</b>
            </span>
          </a>
        );
      })}
    </div>
  );
}
