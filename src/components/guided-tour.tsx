"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

// ── Tour step definition ──────────────────────────────────────────────

export type TourStep = {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  section: string;
};

// ── All tour steps organized by section ───────────────────────────────

const ALL_TOUR_STEPS: TourStep[] = [
  {
    section: "profile",
    target: '[href="/dashboard/profile"]',
    title: "Your Profile",
    content:
      "This is your public identity. Set your headline, bio, portfolio URL slug, and social links. This is the first thing anyone sees when they visit your portfolio.",
    placement: "right",
  },
  {
    section: "upload",
    target: '[href="/dashboard/upload"]',
    title: "Upload Your Resume",
    content:
      "Upload a PDF or Word resume. Our AI reads it and auto-fills your work history, education, and skills — so you don't have to type anything twice.",
    placement: "right",
  },
  {
    section: "work-history",
    target: '[href="/dashboard/portfolio"]',
    title: "Work History",
    content:
      "If you uploaded a resume, your roles are already here. Review them, tweak descriptions, reorder, or add new positions. This feeds directly into your public portfolio.",
    placement: "right",
  },
  {
    section: "education",
    target: '[href="/dashboard/education"]',
    title: "Education",
    content:
      "Your degrees and certifications — also auto-filled from your resume. Add any that were missed or update details.",
    placement: "right",
  },
  {
    section: "skills",
    target: '[href="/dashboard/skills"]',
    title: "Skills",
    content:
      "Tag your core skills across any profession. These show as badges on your portfolio and help recruiters filter and find you.",
    placement: "right",
  },
  {
    section: "demos",
    target: '[href="/dashboard/demos"]',
    title: "Create a Demo",
    content:
      "This is what makes mivitae different. Hit \"Generate Demo\" — our AI builds an interactive, visual proof of your work. Dashboards, case studies, charts — tailored to your profession.",
    placement: "right",
  },
  {
    section: "demos",
    target: '[href="/dashboard/github"]',
    title: "Import from GitHub",
    content:
      "If you have code projects, connect GitHub and import repos directly as demos. Each one gets a live preview card on your portfolio.",
    placement: "right",
  },
  {
    section: "theme",
    target: '[href="/dashboard/theme"]',
    title: "Theme Studio",
    content:
      "Pick from 18+ presets or fully customize colors, fonts, spacing, and layout. Your portfolio should look like you — not a template.",
    placement: "right",
  },
  {
    section: "skill-scores",
    target: '[href="/dashboard/skill-scores"]',
    title: "Skill Scores",
    content:
      "After you create demos, our AI evaluates them on 5 dimensions: depth, relevance, clarity, problem-solving, and innovation. It's a verified score you can share.",
    placement: "right",
  },
  {
    section: "analytics",
    target: '[href="/dashboard/analytics"]',
    title: "Analytics",
    content:
      "See who's viewing your portfolio, which demos get the most attention, and track views over time. Know when recruiters are looking.",
    placement: "right",
  },
  {
    section: "settings",
    target: '[href="/dashboard/settings"]',
    title: "Settings",
    content:
      "Manage your subscription, notification preferences, privacy controls, and account details.",
    placement: "right",
  },
];

export const TOUR_SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "upload", label: "Upload Resume" },
  { id: "work-history", label: "Work History" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "demos", label: "Demos" },
  { id: "theme", label: "Theme Studio" },
  { id: "skill-scores", label: "Skill Scores" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
] as const;

const STORAGE_KEY = "mivitae_tour_completed";

// ── Context so any component can trigger the guide ────────────────────

type TourContextValue = {
  startTour: (section?: string) => void;
  startFullTour: () => void;
};

const TourContext = createContext<TourContextValue>({
  startTour: () => {},
  startFullTour: () => {},
});

export const useTour = () => useContext(TourContext);

// ── Spotlight overlay (cutout around target — NO blur) ────────────────

function SpotlightOverlay({
  targetRect,
  onClick,
}: {
  targetRect: DOMRect | null;
  onClick: () => void;
}) {
  if (!targetRect) {
    return (
      <div
        className="fixed inset-0 z-9998 bg-black/40 transition-opacity duration-300"
        onClick={onClick}
      />
    );
  }

  const pad = 6;
  const x = targetRect.left - pad;
  const y = targetRect.top - pad;
  const w = targetRect.width + pad * 2;
  const h = targetRect.height + pad * 2;
  const r = 8;

  return (
    <svg
      className="fixed inset-0 z-9998 h-full w-full transition-opacity duration-300"
      onClick={onClick}
    >
      <defs>
        <mask id="spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={r} ry={r} fill="black" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.45)"
        mask="url(#spotlight-mask)"
      />
    </svg>
  );
}

// ── Tooltip positioning ───────────────────────────────────────────────

function getTooltipStyle(
  targetRect: DOMRect,
  placement: TourStep["placement"] = "right"
): React.CSSProperties {
  const gap = 12;
  switch (placement) {
    case "top":
      return {
        position: "fixed",
        bottom: window.innerHeight - targetRect.top + gap,
        left: targetRect.left + targetRect.width / 2,
        transform: "translateX(-50%)",
      };
    case "bottom":
      return {
        position: "fixed",
        top: targetRect.bottom + gap,
        left: targetRect.left + targetRect.width / 2,
        transform: "translateX(-50%)",
      };
    case "left":
      return {
        position: "fixed",
        top: targetRect.top + targetRect.height / 2,
        right: window.innerWidth - targetRect.left + gap,
        transform: "translateY(-50%)",
      };
    case "right":
    default:
      return {
        position: "fixed",
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.right + gap,
        transform: "translateY(-50%)",
      };
  }
}

// ── Main GuidedTour component ─────────────────────────────────────────

export function GuidedTour({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => {
        setSteps(ALL_TOUR_STEPS);
        setStepIdx(0);
        setActive(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startFullTour = useCallback(() => {
    setSteps(ALL_TOUR_STEPS);
    setStepIdx(0);
    setActive(true);
  }, []);

  const startTour = useCallback((section?: string) => {
    if (!section) {
      startFullTour();
      return;
    }
    const sectionSteps = ALL_TOUR_STEPS.filter((s) => s.section === section);
    if (sectionSteps.length === 0) return;
    setSteps(sectionSteps);
    setStepIdx(0);
    setActive(true);
  }, [startFullTour]);

  const updateRect = useCallback(() => {
    if (!active || !steps[stepIdx]) return;
    const el = document.querySelector(steps[stepIdx].target) as HTMLElement | null;
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      setTargetRect(null);
    }
  }, [active, steps, stepIdx]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect]);

  const handleNext = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const handleClose = () => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const currentStep = steps[stepIdx];

  return (
    <TourContext.Provider value={{ startTour, startFullTour }}>
      {children}

      {active && currentStep && (
        <>
          <SpotlightOverlay targetRect={targetRect} onClick={handleClose} />

          {targetRect && (
            <div
              className="z-9999 w-80 rounded-xl border bg-popover p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
              style={getTooltipStyle(targetRect, currentStep.placement)}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">{currentStep.title}</h4>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Close tour"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {currentStep.content}
              </p>

              <div className="mt-3 flex items-center gap-1">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStepIdx(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === stepIdx
                        ? "w-4 bg-primary"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {stepIdx + 1} / {steps.length}
                </span>
                <div className="flex gap-1.5">
                  {stepIdx > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={handlePrev}
                    >
                      <ChevronLeft className="mr-0.5 h-3 w-3" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleNext}
                  >
                    {stepIdx === steps.length - 1 ? "Done" : "Next"}
                    {stepIdx < steps.length - 1 && (
                      <ChevronRight className="ml-0.5 h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </TourContext.Provider>
  );
}
