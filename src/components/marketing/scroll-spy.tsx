"use client";

import { useState, useEffect, useCallback } from "react";

const SECTIONS = [
  { id: "hero-cta-sentinel", label: "Top" },
  { id: "how-it-works", label: "How It Works" },
  { id: "features", label: "Features" },
  { id: "for-teams", label: "For Teams" },
  { id: "pricing", label: "Pricing" },
];

export function ScrollSpy() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const scrollToId = useCallback((id: string) => {
    if (id === "hero-cta-sentinel") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const visibleSet = new Set<string>();

    const update = () => {
      // Pick the first visible section in document order
      for (const s of SECTIONS) {
        if (visibleSet.has(s.id)) {
          setActiveId(s.id);
          return;
        }
      }
      // Nothing visible - pick last seen
    };

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) visibleSet.add(s.id);
            else visibleSet.delete(s.id);
          });
          update();
        },
        { threshold: 0.15, rootMargin: "-80px 0px -20% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Page sections"
      style={{
        position: "fixed",
        right: "1.5rem",
        top: "50%",
        transform: `translateY(-50%) ${visible ? "scale(1)" : "scale(0.85)"}`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "6px",
      }}
    >
      {SECTIONS.map((s) => {
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => scrollToId(s.id)}
            title={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {/* Label - only shown on hover / active */}
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: isActive
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground))",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateX(0)" : "translateX(6px)",
                transition: "opacity 0.25s, transform 0.25s, color 0.25s",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </span>
            {/* Dot */}
            <span
              style={{
                display: "block",
                borderRadius: "9999px",
                background: isActive
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground) / 0.4)",
                width: isActive ? "10px" : "6px",
                height: isActive ? "10px" : "6px",
                transition: "width 0.25s, height 0.25s, background 0.25s",
                boxShadow: isActive ? "0 0 0 3px hsl(var(--primary) / 0.2)" : "none",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
