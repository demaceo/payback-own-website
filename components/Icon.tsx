import type { CSSProperties } from "react";
import type { IconName } from "@/lib/site";

type Props = { name: IconName; className?: string; style?: CSSProperties };

/** Decorative icon drawn from the inline sprite. Label the parent control, not the icon. */
export function Icon({ name, className = "ico", style }: Props) {
  return (
    <svg className={className} style={style} aria-hidden="true" focusable="false">
      <use href={`#i-${name}`} />
    </svg>
  );
}
