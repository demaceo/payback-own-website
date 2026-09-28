"use client";

import { useEffect } from "react";
import { STORE_LINKS, type Platform } from "@/lib/site";

function detectPlatform(): Platform | null {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  return /Android/.test(ua) ? "android" : null;
}

/**
 * The page's only client-side behaviour, ported from the original landing-page script.
 * Renders nothing; progressively enhances the server-rendered markup.
 */
export function PageEffects() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Highlight the visitor's store and point the header CTA straight at it.
    const plat = detectPlatform();
    if (plat) {
      document.querySelectorAll(`[data-store="${plat}"]`).forEach((a) => a.classList.add("match"));
      const url = STORE_LINKS[plat];
      const cta = document.getElementById("hdr-cta") as HTMLAnchorElement | null;
      if (url && cta) {
        cta.href = url;
        cta.target = "_blank";
        cta.rel = "noopener noreferrer";
        const label = document.getElementById("hdr-cta-label");
        if (label) label.textContent = "Get the App";
      }
    }

    // In-page links (Download CTA, "Grab the beta", the logo's back-to-top)
    // scroll via JS instead of a native #hash jump. WebKit's native hash-jump,
    // combined with the scroll-behavior:smooth above, leaves touch scrolling
    // stuck afterwards — most visibly as "can't scroll back up" once the
    // Download button has jumped the page down to the store badges.
    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!link || !target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    };
    addEventListener("click", onAnchorClick);
    cleanups.push(() => removeEventListener("click", onAnchorClick));

    // Product Hunt welcome strip.
    if (/producthunt/i.test(`${document.referrer || ""} ${location.search}`)) {
      document.getElementById("ph-bar")?.classList.add("on");
    }

    // Header shadow once the page scrolls.
    const hdr = document.getElementById("hdr");
    if (hdr) {
      const onScroll = () => hdr.classList.toggle("stuck", scrollY > 8);
      onScroll();
      addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => removeEventListener("scroll", onScroll));
    }

    // Scroll-reveal.
    const rv = document.querySelectorAll<HTMLElement>(".rv");
    const revealAll = () => rv.forEach((el) => el.classList.add("in"));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      rv.forEach((el, i) => {
        el.style.transitionDelay = `${(i % 3) * 90}ms`;
        io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    } else {
      revealAll();
    }
    // Safety net: nothing stays hidden, ever.
    const safety = setTimeout(revealAll, 4000);
    cleanups.push(() => clearTimeout(safety));

    // Phone gauge: sweep the arc and count up to 100%.
    const arc = document.getElementById("arc");
    const pct = document.getElementById("pct");
    if (arc && pct) {
      if (reduceMotion) {
        arc.style.strokeDashoffset = "0";
      } else {
        let counter: ReturnType<typeof setInterval> | undefined;
        const start = setTimeout(() => {
          arc.style.transition = "stroke-dashoffset 1.7s cubic-bezier(.2,.8,.3,1)";
          arc.style.strokeDashoffset = "0";
          let n = 0;
          counter = setInterval(() => {
            n += 3;
            if (n >= 100) {
              n = 100;
              clearInterval(counter);
            }
            pct.textContent = `${n}%`;
          }, 26);
        }, 420);
        cleanups.push(() => {
          clearTimeout(start);
          clearInterval(counter);
        });
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
