// ── Environment Variable Validation ─────────────────────────────────────────
// Validates that all required env vars are present at build/startup time.
// Import this in layout.tsx to fail fast if config is missing.

const required = [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
] as const;

const optional = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
  "NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID",
  "NEXT_PUBLIC_SENTRY_DSN",
] as const;

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}`,
  );
}

export const env = {
  ...Object.fromEntries(required.map((k) => [k, process.env[k]!])),
  ...Object.fromEntries(optional.map((k) => [k, process.env[k] ?? undefined])),
} as Record<(typeof required)[number], string> &
  Record<(typeof optional)[number], string | undefined>;
