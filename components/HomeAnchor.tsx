import Link from "next/link";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"a">, "href"> & { hash: string; home: boolean };

/**
 * Link to a section of the home page. On the home page itself it's a plain `#hash`
 * anchor (a native in-page jump); on other pages it's a <Link> back to `/#hash`.
 */
export function HomeAnchor({ hash, home, ...props }: Props) {
  return home ? <a href={`#${hash}`} {...props} /> : <Link href={`/#${hash}`} {...props} />;
}
