import { VALUES } from "@/lib/site";
import { Icon } from "./Icon";

export function ValueStrip() {
  return (
    <section className="strip" aria-label="Why Payback">
      <div className="wrap strip-in">
        {VALUES.map(({ icon, color, title, body }) => (
          <div className="val" key={title}>
            <span className="val-ic" style={{ color }}>
              <Icon name={icon} />
            </span>
            <div>
              <b>{title}</b>
              <p>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
