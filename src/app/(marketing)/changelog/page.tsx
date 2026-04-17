import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — mivitae",
  description: "See what's new in mivitae.",
};

const releases = [
  {
    version: "0.5.0",
    date: "2025-02-10",
    changes: [
      "GitHub repo import — pull repos directly into your portfolio",
      "PDF resume export with print-friendly layout",
      "Word (.docx) and LinkedIn text paste support in resume parser",
      "Demo tag filtering on public portfolios",
      "Email drip campaign for new user onboarding",
      "Guided onboarding tour for first-time users",
      "Error boundary for graceful crash recovery",
    ],
  },
  {
    version: "0.4.0",
    date: "2025-01-28",
    changes: [
      "Skills showcase section with category grouping",
      "Volunteering & community involvement section",
      "Click tracking analytics dashboard",
      "Contact form / Hire Me on public portfolios",
      "Notification center with read/unread management",
      "Admin dashboard for creator accounts",
      "Public portfolio gallery page",
    ],
  },
  {
    version: "0.3.0",
    date: "2025-01-20",
    changes: [
      "6 new theme presets (Midnight, Ocean, Forest, Sunset, Lavender, Monochrome)",
      "Simple ↔ Advanced toggle for demo builder",
      "Cost reduction: switched AI model from Opus to Sonnet",
      "Demo caching to avoid redundant AI calls",
    ],
  },
  {
    version: "0.2.0",
    date: "2025-01-12",
    changes: [
      "AI-powered demo builder with 4-step wizard",
      "Real-time streaming for AI demo generation",
      "Theme injection for consistent portfolio styling",
      "Stripe billing with 3 tiers (Free, Pro, Team)",
    ],
  },
  {
    version: "0.1.0",
    date: "2025-01-01",
    changes: [
      "Initial release with Clerk auth and Convex backend",
      "Resume upload and AI parsing",
      "Public portfolio pages with custom slugs",
      "Dark mode support",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        What&apos;s new and improved in mivitae.
      </p>

      <div className="mt-12 space-y-12">
        {releases.map((release) => (
          <div key={release.version} className="relative pl-6 border-l-2 border-border">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-background" />
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-semibold">v{release.version}</span>
              <time className="text-sm text-muted-foreground">{release.date}</time>
            </div>
            <ul className="mt-3 space-y-1.5">
              {release.changes.map((change, i) => (
                <li key={i} className="text-muted-foreground leading-relaxed">
                  • {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
