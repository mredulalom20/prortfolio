"use client";

import { useEffect, useRef } from "react";

export default function MobileCarousel({ children, className = "", interval = 3200 }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return undefined;

    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = null;

    const getStep = () => {
      const card = track.querySelector("[data-carousel-card]");
      if (!card) return Math.max(track.clientWidth * 0.85, 280);

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return card.getBoundingClientRect().width + gap;
    };

    const scrollNext = () => {
      if (!mobileQuery.matches) return;

      const maxScrollLeft = track.scrollWidth - track.clientWidth - 1;
      if (track.scrollLeft >= maxScrollLeft) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      track.scrollBy({ left: getStep(), behavior: "smooth" });
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      if (reducedMotionQuery.matches || !mobileQuery.matches || timer) return;
      timer = window.setInterval(scrollNext, interval);
    };

    const refresh = () => {
      stop();
      start();
    };

    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("touchstart", stop, { passive: true });
    track.addEventListener("touchend", start, { passive: true });
    window.addEventListener("resize", refresh);
    document.addEventListener("visibilitychange", refresh);

    start();

    return () => {
      stop();
      track.removeEventListener("mouseenter", stop);
      track.removeEventListener("mouseleave", start);
      track.removeEventListener("touchstart", stop);
      track.removeEventListener("touchend", start);
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [interval]);

  return (
    <div ref={trackRef} className={className}>
      {children}
    </div>
  );
}