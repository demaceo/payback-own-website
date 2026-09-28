import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { IconSprite } from "./IconSprite";
import { PageEffects } from "./PageEffects";

/** Chrome shared by every page: icon sprite, header, footer and the progressive-enhancement island. */
/** `home` marks the home page, where section links are in-page anchors. */
export function SiteShell({ children, home = false }: { children: ReactNode; home?: boolean }) {
  return (
    <>
      <IconSprite />
      <Header home={home} />
      <main>{children}</main>
      <Footer home={home} />
      <PageEffects />
    </>
  );
}
