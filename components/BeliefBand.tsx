import { Icon } from "./Icon";

export function BeliefBand() {
  return (
    <section className="band">
      <div className="wrap band-in">
        <span className="band-icon">
          <Icon name="user" />
        </span>
        <div>
          <p className="k">This is more than an app.</p>
          <p className="v">It’s a shift in the way you think, the way you own your data, and who profits from it.</p>
        </div>
        <div className="side">Once you start, you&apos;ll want to stay with it for the rest of your life.</div>
      </div>
    </section>
  );
}
