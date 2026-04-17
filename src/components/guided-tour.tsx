"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

export type TourStep = {
  /** CSS selector for the target element */
  target: string;
  /** Title of the tooltip */
  title: string;
  /** Body text */
  content: string;
  /** Where to position the tooltip relative to the target */
  placement?: "top" | "bottom" | "left" | "right";
};

const DASHBOARD_TOUR: TourStep[] = [
  {
    target: '[href="/dashboard/upload"]',
    title: "Upload Your Resume",
    content: "Start by uploading a PDF or Word resume. Our AI will extract your work history, education, and skills automatically.",
    placement: "right",
  },
  {
    target: '[href="/dashboard/portfolio"]',
    title: "Edit Work History",
    content: "Review and edit the roles parsed from your resume, or add new entries manually.",
    placement: "right",
  },
  {
    target: '[href="/dashboard/demos"]',
    title: "Showcase Your Work",
    content: "Create interactive demos to show off your projects. You can also import repos from GitHub.",
    placement: "right",
  },
  {
    target: '[href="/dashboard/profile"]',
    title: "Set Up Your Profile",
    content: "Add your headline, bio, and social links. Set your portfolio slug for a custom URL.",
    placement: "right",
  },
  {
    target: '[href="/dashboard/theme"]',
    title: "Customize Your Theme",
    content: "Choose from 18+ presets or customize colors, fonts, and layout to make your portfolio unique.",
    placement: "right",
  },
];

const STORAGE_KEY = "mivitae_tour_completed";

function getTooltipPosition(
  target: HTMLElement,
  placement: TourStep["placement"] = "right"
) {
  const rect = target.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  switch (placement) {
    case "top":
      return {
        top: rect.top + scrollY - 10,
        left: rect.left + scrollX + rect.width / 2,
        transform: "translate(-50%, -100%)",
      };
    case "bottom":
      return {
        top: rect.bottom + scrollY + 10,
        left: rect.left + scrollX + rect.width / 2,
        transform: "translate(-50%, 0)",
      };
    case "left":
      return {
        top: rect.top + scrollY + rect.height / 2,
        left: rect.left + scrollX - 10,
        transform: "translate(-100%, -50%)",
      };
    case "right":
    default:
      return {
        top: rect.top + scrollY + rect.height / 2,
        left: rect.right + scrollX + 10,
        transform: "translate(0, -50%)",
      };
  }
}

export function GuidedTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState<ReturnType<typeof getTooltipPosition> | null>(null);

  // Show tour for first-time users
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay start to let the dashboard render
      const timer = setTimeout(() => setActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const updatePosition = useCallback(() => {
    if (!active) return;
    const currentStep = DASHBOARD_TOUR[step];
    if (!currentStep) return;

    const el = document.querySelector(currentStep.target) as HTMLElement | null;
    if (el) {
      setPosition(getTooltipPosition(el, currentStep.placement));
      // Scroll element into view
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setPosition(null);
    }
  }, [active, step]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [updatePosition]);

  const handleNext = () => {
    if (step < DASHBOARD_TOUR.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!active || !position) return null;

  const currentStep = DASHBOARD_TOUR[step];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-72 rounded-xl border bg-popover p-4 shadow-lg animate-in fade-in-0 zoom-in-95"
        style={{
          top: position.top,
          left: position.left,
          transform: position.transform,
        }}
      >
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">{currentStep.title}</h4>
          </div>
          <button
            onClick={handleClose}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          {currentStep.content}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {step + 1} / {DASHBOARD_TOUR.length}
          </span>
          <div className="flex gap-1.5">
            {step > 0 && (
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
              {step === DASHBOARD_TOUR.length - 1 ? "Done" : "Next"}
              {step < DASHBOARD_TOUR.length - 1 && (
                <ChevronRight className="ml-0.5 h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
