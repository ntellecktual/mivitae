"use client";

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

// ── Tour step definition ──────────────────────────────────────────────

export type TourStep = {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  section: string;
  /** Page to navigate to before showing this step */
  href?: string;
  /** "nav" = sidebar link highlight, "page" = in-page element */
  phase: "nav" | "page";
};

// ── All tour steps organized by section ───────────────────────────────

const ALL_TOUR_STEPS: TourStep[] = [
  // ── Profile ──
  {
    section: "profile",
    phase: "nav",
    target: '[href="/dashboard/profile"]',
    title: "Your Profile",
    content: "This is where you build your public identity. Let's take a look inside.",
    placement: "right",
  },
  {
    section: "profile",
    phase: "page",
    href: "/dashboard/profile",
    target: '[data-tour="profile-slug"]',
    title: "Your Portfolio URL",
    content: "Set your custom URL slug and toggle public visibility. Share this link with recruiters, clients, and collaborators.",
    placement: "bottom",
  },
  {
    section: "profile",
    phase: "page",
    href: "/dashboard/profile",
    target: '[data-tour="profile-about"]',
    title: "About You",
    content: "Write your headline and bio — this is the first thing people read. Add your location so employers in your area can find you.",
    placement: "right",
  },
  {
    section: "profile",
    phase: "page",
    href: "/dashboard/profile",
    target: '[data-tour="profile-links"]',
    title: "Social Links",
    content: "Add your website, LinkedIn, and GitHub. These show as clickable icons on your portfolio.",
    placement: "right",
  },
  {
    section: "profile",
    phase: "page",
    href: "/dashboard/profile",
    target: '[data-tour="profile-save"]',
    title: "Save & Preview",
    content: "Hit Save Changes when you're done. The live preview on the right updates as you type.",
    placement: "left",
  },

  // ── Upload ──
  {
    section: "upload",
    phase: "nav",
    target: '[href="/dashboard/upload"]',
    title: "Upload Resume",
    content: "Upload a resume and our AI does the heavy lifting. Let's see how.",
    placement: "right",
  },
  {
    section: "upload",
    phase: "page",
    href: "/dashboard/upload",
    target: '[data-tour="upload-dropzone"]',
    title: "Drag & Drop Your Resume",
    content: "Drop a PDF or Word file here, or click Browse. Our AI extracts your work history, education, and skills in seconds.",
    placement: "bottom",
  },
  {
    section: "upload",
    phase: "page",
    href: "/dashboard/upload",
    target: '[data-tour="upload-linkedin"]',
    title: "Or Paste from LinkedIn",
    content: "Copy your LinkedIn profile text and paste it here. We'll parse it the same way — no file needed.",
    placement: "top",
  },

  // ── Work History ──
  {
    section: "work-history",
    phase: "nav",
    target: '[href="/dashboard/portfolio"]',
    title: "Work History",
    content: "Your professional timeline lives here. Let's look inside.",
    placement: "right",
  },
  {
    section: "work-history",
    phase: "page",
    href: "/dashboard/portfolio",
    target: '[data-tour="portfolio-add"]',
    title: "Add a Position",
    content: "Click here to add a role manually. If you uploaded a resume, your positions are already listed on the timeline below.",
    placement: "bottom",
  },

  // ── Education ──
  {
    section: "education",
    phase: "nav",
    target: '[href="/dashboard/education"]',
    title: "Education",
    content: "Degrees and certifications — also auto-filled from your resume.",
    placement: "right",
  },
  {
    section: "education",
    phase: "page",
    href: "/dashboard/education",
    target: '[data-tour="education-add"]',
    title: "Add Education",
    content: "Add degrees, certifications, or courses. Each entry shows details like GPA, honors, and relevant coursework.",
    placement: "bottom",
  },

  // ── Skills ──
  {
    section: "skills",
    phase: "nav",
    target: '[href="/dashboard/skills"]',
    title: "Skills",
    content: "Tag your expertise across any profession.",
    placement: "right",
  },
  {
    section: "skills",
    phase: "page",
    href: "/dashboard/skills",
    target: '[data-tour="skills-add"]',
    title: "Add a Skill",
    content: "Add skills with a category, proficiency level (1–5), and years of experience. They show as filterable badges on your portfolio.",
    placement: "bottom",
  },

  // ── Demos ──
  {
    section: "demos",
    phase: "nav",
    target: '[href="/dashboard/demos"]',
    title: "Demo Studio",
    content: "This is what makes mivitae different. Let's see how demos work.",
    placement: "right",
  },
  {
    section: "demos",
    phase: "page",
    href: "/dashboard/demos",
    target: '[data-tour="demos-mode"]',
    title: "Simple vs Advanced",
    content: "Simple mode walks you through a wizard. Advanced gives you full control over templates and customization.",
    placement: "bottom",
  },
  {
    section: "demos",
    phase: "page",
    href: "/dashboard/demos",
    target: '[data-tour="demos-new"]',
    title: "Create a New Demo",
    content: "Click here to generate an interactive demo. Our AI builds visual proofs — dashboards, case studies, charts — tailored to your profession.",
    placement: "bottom",
  },

  // ── GitHub Import ──
  {
    section: "github",
    phase: "nav",
    target: '[href="/dashboard/github"]',
    title: "Import from GitHub",
    content: "Connect GitHub and import repos directly as portfolio demos. Each one gets a live preview card.",
    placement: "right",
  },
  {
    section: "github",
    phase: "page",
    href: "/dashboard/github",
    target: '[data-tour="github-connect"]',
    title: "Connect Your GitHub",
    content: "Enter your GitHub username or connect your account. We'll fetch your repositories so you can import them as portfolio demos.",
    placement: "bottom",
  },

  // ── Volunteering ──
  {
    section: "volunteering",
    phase: "nav",
    target: '[href="/dashboard/volunteering"]',
    title: "Volunteering",
    content: "Showcase community involvement, leadership, and causes you care about.",
    placement: "right",
  },
  {
    section: "volunteering",
    phase: "page",
    href: "/dashboard/volunteering",
    target: '[data-tour="volunteering-add"]',
    title: "Add Volunteering",
    content: "Add volunteer roles with the organization, your position, cause area, dates, and a description of your impact.",
    placement: "bottom",
  },

  // ── Theme Studio ──
  {
    section: "theme",
    phase: "nav",
    target: '[href="/dashboard/theme"]',
    title: "Theme Studio",
    content: "Make your portfolio look like you — not a template. Let's walk through the tools.",
    placement: "right",
  },
  {
    section: "theme",
    phase: "page",
    href: "/dashboard/theme",
    target: '[data-tour="theme-tab-presets"]',
    title: "Presets",
    content: "Start here — pick from 18+ curated presets as your base. Each one sets colors, fonts, and layout in one click.",
    placement: "bottom",
  },
  {
    section: "theme",
    phase: "page",
    href: "/dashboard/theme",
    target: '[data-tour="theme-tab-colors"]',
    title: "Colors",
    content: "Fine-tune your palette — accent, background, text, and card colors. Choose from swatches or use AI-generated palettes.",
    placement: "bottom",
  },
  {
    section: "theme",
    phase: "page",
    href: "/dashboard/theme",
    target: '[data-tour="theme-tab-fonts"]',
    title: "Fonts",
    content: "Choose a heading + body font pairing, or pick individual fonts. Adjust the font scale for readability.",
    placement: "bottom",
  },
  {
    section: "theme",
    phase: "page",
    href: "/dashboard/theme",
    target: '[data-tour="theme-tab-layout"]',
    title: "Layout",
    content: "Select your hero layout, card template, content width, and section spacing. See changes instantly in the live preview.",
    placement: "bottom",
  },
  {
    section: "theme",
    phase: "page",
    href: "/dashboard/theme",
    target: '[data-tour="theme-tab-style"]',
    title: "Style",
    content: "Customize navigation, button styles, social icons, image filters, and splash screens.",
    placement: "bottom",
  },
  {
    section: "theme",
    phase: "page",
    href: "/dashboard/theme",
    target: '[data-tour="theme-preview"]',
    title: "Live Preview",
    content: "This is your live portfolio preview. Every change you make shows here instantly. Use the device switcher at the bottom to see mobile and tablet views.",
    placement: "left",
  },
  {
    section: "theme",
    phase: "page",
    href: "/dashboard/theme",
    target: '[data-tour="theme-publish"]',
    title: "Publish Your Theme",
    content: "When you're happy with your design, hit Publish. Your changes go live immediately on your public portfolio.",
    placement: "top",
  },

  // ── Skill Scores ──
  {
    section: "skill-scores",
    phase: "nav",
    target: '[href="/dashboard/skill-scores"]',
    title: "Skill Scores",
    content: "After you create demos, our AI evaluates them. Let's see how scoring works.",
    placement: "right",
  },
  {
    section: "skill-scores",
    phase: "page",
    href: "/dashboard/skill-scores",
    target: '[data-tour="scores-summary"]',
    title: "Your Score Overview",
    content: "See your average score, verified demo count, and ungraded demos at a glance. Each demo is scored on depth, relevance, clarity, problem-solving, and innovation.",
    placement: "bottom",
  },

  // ── Analytics ──
  {
    section: "analytics",
    phase: "nav",
    target: '[href="/dashboard/analytics"]',
    title: "Analytics",
    content: "See who's viewing your portfolio and which demos get the most attention.",
    placement: "right",
  },
  {
    section: "analytics",
    phase: "page",
    href: "/dashboard/analytics",
    target: '[data-tour="analytics-stats"]',
    title: "Track Your Views",
    content: "See 30-day views, all-time views, and your best day. The chart shows daily traffic so you know when recruiters are looking.",
    placement: "bottom",
  },

  // ── Settings ──
  {
    section: "settings",
    phase: "nav",
    target: '[href="/dashboard/settings"]',
    title: "Settings",
    content: "Manage your account, subscription, and preferences.",
    placement: "right",
  },
  {
    section: "settings",
    phase: "page",
    href: "/dashboard/settings",
    target: '[data-tour="settings-plan"]',
    title: "Your Plan",
    content: "View your current plan and upgrade to Pro for full access to colors, fonts, layout, motion, custom CSS, and analytics.",
    placement: "bottom",
  },
];

export const TOUR_SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "upload", label: "Upload Resume" },
  { id: "work-history", label: "Work History" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "demos", label: "Demos" },
  { id: "github", label: "GitHub Import" },
  { id: "volunteering", label: "Volunteering" },
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
  const tooltipW = 320; // matches w-80
  const tooltipH = 200; // approximate max height
  const pad = 12; // viewport edge padding
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let style: React.CSSProperties = { position: "fixed" };

  switch (placement) {
    case "top":
      style.bottom = vh - targetRect.top + gap;
      style.left = Math.max(pad, Math.min(targetRect.left + targetRect.width / 2 - tooltipW / 2, vw - tooltipW - pad));
      break;
    case "bottom":
      style.top = Math.min(targetRect.bottom + gap, vh - tooltipH - pad);
      style.left = Math.max(pad, Math.min(targetRect.left + targetRect.width / 2 - tooltipW / 2, vw - tooltipW - pad));
      break;
    case "left":
      style.top = Math.max(pad, Math.min(targetRect.top + targetRect.height / 2 - tooltipH / 2, vh - tooltipH - pad));
      style.right = vw - targetRect.left + gap;
      break;
    case "right":
    default: {
      style.top = Math.max(pad, Math.min(targetRect.top + targetRect.height / 2 - tooltipH / 2, vh - tooltipH - pad));
      const idealLeft = targetRect.right + gap;
      if (idealLeft + tooltipW > vw - pad) {
        // Flip to left side if not enough room on right
        style.right = vw - targetRect.left + gap;
      } else {
        style.left = idealLeft;
      }
      break;
    }
  }

  return style;
}

// ── Main GuidedTour component ─────────────────────────────────────────

export function GuidedTour({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-start for first-time users
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
    // Section-specific: show only "page" steps (skip sidebar nav highlight)
    const sectionSteps = ALL_TOUR_STEPS.filter(
      (s) => s.section === section && s.phase === "page"
    );
    if (sectionSteps.length === 0) {
      // Fallback: section has only nav steps (e.g., analytics, skill-scores)
      const navSteps = ALL_TOUR_STEPS.filter((s) => s.section === section);
      if (navSteps.length === 0) return;
      setSteps(navSteps);
    } else {
      setSteps(sectionSteps);
    }
    setStepIdx(0);
    setActive(true);
  }, [startFullTour]);

  const currentStep = steps[stepIdx] ?? null;

  // Navigate when needed + find target element with retry
  useEffect(() => {
    if (!active || !currentStep) return;

    // Clear previous retry
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    // Navigate if the step requires a different page
    if (currentStep.href && pathname !== currentStep.href) {
      router.push(currentStep.href);
      setTargetRect(null);
      return; // Wait for pathname to update, this effect will re-run
    }

    // Find target element with retry (page may still be rendering)
    let attempts = 0;
    const find = () => {
      const el = document.querySelector(currentStep.target) as HTMLElement | null;
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (attempts < 15) {
        attempts++;
        retryTimerRef.current = setTimeout(find, 200);
      } else {
        setTargetRect(null);
      }
    };
    find();

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [active, currentStep, pathname, router]);

  // Update rect on scroll/resize
  useEffect(() => {
    if (!active || !currentStep) return;
    const update = () => {
      const el = document.querySelector(currentStep.target) as HTMLElement | null;
      if (el) setTargetRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, currentStep]);

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
