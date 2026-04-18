"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * A floating pill CTA that slides up from the bottom once the hero CTA
 * scrolls out of view, giving visitors a persistent sign-up prompt
 * throughout the page. Hides again if they scroll back to the top.
 */
export function FloatingCTA() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = document.getElementById("hero-cta-sentinel");
    if (!sentinel || !ctaRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!ctaRef.current) return;
          if (entry.isIntersecting) {
            ctaRef.current.classList.remove("show");
          } else {
            ctaRef.current.classList.add("show");
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ctaRef} className="floating-cta">
      <Link
        href="/sign-up"
        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/90 px-5 py-2.5 text-sm font-semibold shadow-xl shadow-primary/10 backdrop-blur-xl transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-primary/25"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Start for Free
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
