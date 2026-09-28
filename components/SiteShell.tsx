import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { IconSprite } from "./IconSprite";
import { PageEffects } from "./PageEffects";

/** Chrome shared by every page: icon sprite, header, footer and the progressive-enhancement island. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <IconSprite />
      <Header />
      <main>{children}</main>
      <Footer />
      <PageEffects />
    </>
  );
}
