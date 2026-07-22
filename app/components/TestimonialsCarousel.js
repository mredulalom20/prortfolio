"use client";

import { useEffect, useRef, useState } from "react";
import SmartImage from "./SmartImage";

function getVisibleCount() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

export default function TestimonialsCarousel({ reviews }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [offset, setOffset] = useState(0);

  const maxIndex = Math.max(reviews.length - visibleCount, 0);
  const canSlide = reviews.length > visibleCount;

  useEffect(() => {
    const refresh = () => {
      setVisibleCount(getVisibleCount());
    };

    refresh();
    window.addEventListener("resize", refresh);
    return () => window.removeEventListener("resize", refresh);
  }, []);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.querySelector("[data-testimonial-card]");
    if (!track || !card) return;

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    setOffset(activeIndex * (card.getBoundingClientRect().width + gap));
  }, [activeIndex, visibleCount, reviews.length]);

  useEffect(() => {
    if (!canSlide) return undefined;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index >= maxIndex ? 0 : index + 1));
    }, 4200);

    return () => window.clearInterval(timer);
  }, [canSlide, maxIndex]);

  const goTo = (direction) => {
    setActiveIndex((index) => {
      if (direction < 0) return index <= 0 ? maxIndex : index - 1;
      return index >= maxIndex ? 0 : index + 1;
    });
  };

  return (
    <div className="relative overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-8 transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {reviews.map((review) => (
          <article key={review.id} data-testimonial-card className="w-full shrink-0 rounded-2xl border border-white/5 bg-surface p-8 shadow-xl md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]">
            <div className="mb-6 flex items-center gap-4">
              {review.avatar_url ? (
                <SmartImage src={review.avatar_url} alt={review.name} className="size-14 rounded-full border-2 border-primary/30 object-cover" />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/20 text-xl font-black text-primary">
                  {review.name?.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-white">{review.name}</h4>
                {review.role && <p className="text-sm font-medium text-primary">{review.role}</p>}
              </div>
            </div>
            <p className="leading-relaxed text-slate-300">“{review.message}”</p>
          </article>
        ))}
      </div>

      {canSlide && (
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => goTo(-1)}
            className="flex size-11 items-center justify-center rounded-full border border-white/10 text-primary transition-colors hover:border-primary hover:bg-primary/10"
            aria-label="Previous testimonial"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(1)}
            className="flex size-11 items-center justify-center rounded-full border border-white/10 text-primary transition-colors hover:border-primary hover:bg-primary/10"
            aria-label="Next testimonial"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
