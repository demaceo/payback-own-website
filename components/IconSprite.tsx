import { SPRITE_MARKUP } from "./sprite-markup";

/** Rendered once at the top of <body>; every <Icon> references a symbol inside it. */
export function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
      // Static, first-party markup authored in this repo; no user input reaches it.
      dangerouslySetInnerHTML={{ __html: `<defs>${SPRITE_MARKUP}</defs>` }}
    />
  );
}
