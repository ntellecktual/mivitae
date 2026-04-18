"use client";

import { useEffect, useState, useRef } from "react";

const WORDS = [
  "r\u00e9sum\u00e9",
  "vitae",
  "CV",
  "portfolio",
  "cover letter",
];

const TYPE_MS = 90;
const DELETE_MS = 50;
const HOLD_MS = 2200;
const PAUSE_MS = 400;

export function WordRotator() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const word = WORDS[wordIdx];

    if (!isDeleting && displayed === word) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), HOLD_MS);
    } else if (isDeleting && displayed === "") {
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
    <span className="inline text-primary" aria-live="polite">
      {displayed}
      <span className="ml-px animate-blink border-r-2 border-primary" />
    </span>
  );
}
