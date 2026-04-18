"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Words that rotate in "Your _____ is dead."
 * The longest word sets the invisible width so layout never shifts.
 */
const WORDS = [
  "r\u00e9sum\u00e9",
  "vitae",
  "CV",
  "portfolio",
  "cover letter",
  "LinkedIn",
];

const LONGEST = WORDS.reduce((a, b) => (a.length >= b.length ? a : b));

const TYPE_MS = 90; // ms per character typed
const DELETE_MS = 50; // ms per character deleted
const HOLD_MS = 2200; // ms to hold the full word
const PAUSE_MS = 400; // ms pause when empty before next word

export function WordRotator() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const word = WORDS[wordIdx];

    if (!isDeleting && displayed === word) {
      // Hold, then start deleting
      timeoutRef.current = setTimeout(() => setIsDeleting(true), HOLD_MS);
    } else if (isDeleting && displayed === "") {
      // Pause, then move to next word
      timeoutRef.current = setTimeout(() => {
        setIsDeleting(false);
        setWordIdx((i) => (i + 1) % WORDS.length);
      }, PAUSE_MS);
    } else if (isDeleting) {
      timeoutRef.current = setTimeout(
        () => setDisplayed((d) => d.slice(0, -1)),
        DELETE_MS,
      );
    } else {
      timeoutRef.current = setTimeout(
        () => setDisplayed(word.slice(0, displayed.length + 1)),
        TYPE_MS,
      );
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayed, isDeleting, wordIdx]);

  return (
    <span className="relative inline-block text-left align-baseline">
      {/* Invisible sizer — keeps the container as wide as the longest word */}
      <span className="invisible" aria-hidden="true">
        {LONGEST}
      </span>

      {/* Visible typed text — absolutely positioned over the sizer */}
      <span className="absolute inset-0 text-primary" aria-live="polite">
        {displayed}
        <span className="ml-px animate-blink border-r-2 border-primary" />
      </span>
    </span>
  );
}
