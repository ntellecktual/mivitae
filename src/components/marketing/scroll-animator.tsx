"use client";

import { useEffect } from "react";

/**
 * Attaches an IntersectionObserver to every [data-animate] element on the page.
 * When an element enters the viewport it receives the `.is-visible` class,
 * which triggers its CSS transition defined in globals.css.
 */
export function ScrollAnimator() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" }
    );

    document.querySelectorAll("[data-animate], [data-animate-card]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
