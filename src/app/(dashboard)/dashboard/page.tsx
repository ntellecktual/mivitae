"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Briefcase,
  GraduationCap,
  Zap,
  ArrowRight,
  FileText,
  CheckCircle,
  Clock,
  Rocket,
  Eye,
  Share2,
  BarChart3,
  Copy,
  Check,
  ExternalLink,
  Palette,
  User,
  CreditCard,
  Gift,
  TrendingUp,
  Users,
  Sparkles,
  Crown,
  Heart,
  Wrench,
  MousePointerClick,
  GitBranch,
  Shield,
  FileDown,
  Command,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Plan display names ────────────────────────────────────────────────────────
const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

// ── Completion Score ──────────────────────────────────────────────────────────

type ProfileShape = {
  headline?: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  slug?: string;
  isPublic?: boolean;
  avatarUrl?: string;
  themeConfig?: unknown;
};

function calcCompletion(profile: ProfileShape | null | undefined): {
  score: number;
  items: { label: string; done: boolean; href: string }[];
} {
  if (!profile) return { score: 0, items: [] };

  const items = [
    { label: "Write a headline", done: !!profile.headline, href: "/dashboard/profile", pts: 20 },
    { label: "Add a bio", done: !!profile.bio, href: "/dashboard/profile", pts: 20 },
    { label: "Make profile public", done: !!profile.isPublic, href: "/dashboard/profile", pts: 20 },
    { label: "Add a social link", done: !!(profile.websiteUrl || profile.linkedinUrl || profile.githubUrl), href: "/dashboard/profile", pts: 15 },
    { label: "Set a custom URL slug", done: !!(profile.slug && profile.slug.length > 3), href: "/dashboard/profile", pts: 10 },
    { label: "Customize your theme", done: !!profile.themeConfig, href: "/dashboard/theme", pts: 10 },
    { label: "Add a location", done: !!profile.location, href: "/dashboard/profile", pts: 5 },
  ];

  const total = items.reduce((s, i) => s + i.pts, 0);
  const earned = items.filter((i) => i.done).reduce((s, i) => s + i.pts, 0);
  const score = Math.round((earned / total) * 100);

  return { score, items: items.map(({ label, done, href }) => ({ label, done, href })) };
}

// ── Keyboard shortcut actions ─────────────────────────────────────────────────

const SHORTCUTS = [
  { key: "p", href: "/dashboard/profile", label: "Profile", icon: User },
  { key: "w", href: "/dashboard/portfolio", label: "Work History", icon: Briefcase },
  { key: "e", href: "/dashboard/education", label: "Education", icon: GraduationCap },
  { key: "s", href: "/dashboard/skills", label: "Skills", icon: Wrench },
  { key: "d", href: "/dashboard/demos", label: "Demos", icon: Zap },
  { key: "t", href: "/dashboard/theme", label: "Theme Studio", icon: Palette },
  { key: "a", href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { key: "u", href: "/dashboard/upload", label: "Upload Resume", icon: Upload },
  { key: "r", href: "/dashboard/referrals", label: "Referrals", icon: Gift },
  { key: "g", href: "/dashboard/github", label: "GitHub Import", icon: GitBranch },
  { key: "v", href: "/dashboard/volunteering", label: "Volunteering", icon: Heart },
  { key: "c", href: "/dashboard/clicks", label: "Click Tracking", icon: MousePointerClick },
  { key: "k", href: "/dashboard/skill-scores", label: "Skill Scores", icon: Shield },
  { key: "x", href: "/dashboard/export", label: "Export PDF", icon: FileDown },
  { key: "m", href: "/dashboard/messages", label: "Messages", icon: Mail },
  { key: ",", href: "/dashboard/settings", label: "Settings", icon: CreditCard },
];

// ── Share Widget ──────────────────────────────────────────────────────────────

function ShareCard({ slug }: { slug: string }) {
  const url = `https://mivitae.org/u/${slug}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Share2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">Your portfolio is live</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Share it everywhere — each share is a free impression.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                mivitae.org/u/{slug}
              </span>
              <button
                onClick={handleCopy}
                aria-label="Copy link"
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <ExternalLink className="h-3 w-3" /> View Live
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                Share on LinkedIn
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                Share on Facebook
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const convexUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id ?? "",
  });
  const latestResume = useQuery(
    api.resumes.getLatest,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const onboardingState = useQuery(api.onboarding.getSelf);
  const viewCount = useQuery(api.analytics.getSelfViewCount);
  const profile = useQuery(api.profiles.getSelf);
  const selfPlan = useQuery(api.subscriptions.getSelfPlan);
  const subscription = useQuery(api.subscriptions.getSelf);
  const referralStats = useQuery(api.referrals.getMyStats);

  const firstName = user?.firstName ?? "there";

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs / textareas or when modifiers are held (except shift for , key)
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const match = SHORTCUTS.find((s) => s.key === e.key.toLowerCase());
      if (match) {
        e.preventDefault();
        router.push(match.href);
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Wait for primary queries to avoid layout shift
  if (profile === undefined || selfPlan === undefined) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="h-9 w-64 rounded-lg bg-muted animate-shimmer-pulse" />
          <div className="mt-2 h-5 w-80 rounded-lg bg-muted animate-shimmer-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border bg-muted animate-shimmer-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border bg-muted animate-shimmer-pulse" style={{ animationDelay: `${(i + 4) * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  const showOnboardingBanner =
    onboardingState !== undefined && onboardingState !== null && !onboardingState.isComplete;

  const { score, items: completionItems } = calcCompletion(profile);
  const incomplete = completionItems.filter((i) => !i.done);

  const planId = selfPlan?.plan ?? "free";
  const planLabel = PLAN_LABELS[planId] ?? planId;
  const isCreator = selfPlan?.isCreator ?? false;
  const isFounder = selfPlan?.isFoundingUser ?? false;
  const isPaid = planId !== "free";

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Onboarding banner */}
      {showOnboardingBanner && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">Finish setting up your portfolio</p>
              <p className="text-xs text-muted-foreground">
                Step {(onboardingState.currentStep ?? 0) + 1} of 6 — complete the wizard to go live.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/onboarding"
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Continue setup <ArrowRight className="ml-1.5 h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
            Your command center for everything mivitae
            <span className="hidden sm:inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60">
              <Command className="h-2.5 w-2.5" /> Press a key to navigate
            </span>
          </p>
        </div>
        {(isFounder || isCreator) && (
          <div className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
            isCreator
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          )}>
            <Sparkles className="h-3 w-3" />
            {isCreator ? "Creator" : "Founding Member"}
          </div>
        )}
      </div>

      {/* Hero row: Live preview (dominant) + sidebar cards */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left column: condensed cards */}
        <div className="flex flex-col gap-4 lg:col-span-2 order-2 lg:order-1">
          {/* Completion checklist */}
          {score < 100 && incomplete.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Complete your profile</h2>
                  <span className="text-xs text-muted-foreground">{score}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted mb-4">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {completionItems.map(({ label, done, href }) => (
                    <Link
                      key={label}
                      href={done ? "#" : href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                        done ? "pointer-events-none opacity-40" : "hover:bg-muted"
                      )}
                    >
                      <CheckCircle
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          done ? "text-green-500" : "text-muted-foreground/30"
                        )}
                      />
                      <span className={cn("text-xs", done && "line-through")}>{label}</span>
                      {!done && <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : score === 100 ? (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-3">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="font-semibold text-green-700 dark:text-green-400">Profile is fully optimized</p>
                <p className="mt-1 text-xs text-muted-foreground">All items complete — you&apos;re making a great impression.</p>
              </CardContent>
            </Card>
          ) : null}

          {/* Resume card */}
          {latestResume ? (
            <Link href="/dashboard/upload">
              <Card className="card-hover h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <StatusBadge status={latestResume.parseStatus} />
                  </div>
                  <p className="truncate font-semibold text-sm">{latestResume.fileName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Uploaded {new Date(latestResume.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="mt-3 text-xs text-primary font-medium">Upload a new version →</p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Link href="/dashboard/upload">
              <Card className="card-hover border-dashed h-full">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-sm">Upload resume</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">AI parses your career in ~30s</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Compact stats: Views + Strength */}
          <div className="grid gap-3 grid-cols-2">
            <Link href="/dashboard/analytics">
              <Card className="card-hover overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Views</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{viewCount ?? "—"}</p>
                  <div className="mt-2 flex items-end gap-px h-5">
                    {[30, 55, 40, 70, 50, 80, 65, 90, 75, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: `color-mix(in srgb, var(--primary) ${30 + i * 7}%, transparent)`,
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/profile">
              <Card className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Strength</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                      <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15"
                          fill="none"
                          stroke="currentColor"
                          strokeOpacity={1}
                          strokeWidth="3"
                          strokeDasharray={`${(score / 100) * 94.25} 94.25`}
                          strokeLinecap="round"
                          className="text-primary transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold">{score}</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{score}%</p>
                      <p className="text-[10px] text-muted-foreground">
                        {score === 100 ? "Optimized" : `${incomplete.length} to go`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Compact stats: Plan + Referrals */}
          <div className="grid gap-3 grid-cols-2">
            <Link href="/dashboard/settings">
              <Card className={cn("card-hover", isPaid && "border-primary/20")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {isPaid ? <Crown className="h-4 w-4 text-primary" /> : <CreditCard className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Plan</span>
                  </div>
                  <p className="text-lg font-bold">{planLabel}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isCreator ? "Owner — unlimited" :
                     isFounder ? "Founding member" :
                     subscription?.status === "trialing" ? `Trial · ${Math.max(0, Math.ceil((subscription.currentPeriodEnd * 1000 - Date.now()) / 86400000))}d left` :
                     subscription?.status === "active" ? `Renews ${new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` :
                     "Upgrade for full access"}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/referrals">
              <Card className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Referrals</span>
                  </div>
                  <p className="text-lg font-bold">{referralStats?.total ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {referralStats?.credits
                      ? `${referralStats.credits} credit${referralStats.credits !== 1 ? "s" : ""} earned`
                      : "Invite friends to earn"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right column: Live Preview (dominant) */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          {profile?.isPublic && profile.slug ? (
            <Link href="/dashboard/theme" className="block h-full">
              <Card className="group card-hover overflow-hidden border-primary/10 h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="relative flex-1 min-h-[400px] overflow-hidden bg-gradient-to-br from-primary/5 via-background to-violet-500/5">
                    <iframe
                      src={`/u/${profile.slug}`}
                      className="pointer-events-none h-[300%] w-[300%] origin-top-left scale-[0.3333] border-0"
                      tabIndex={-1}
                      aria-hidden
                      loading="lazy"
                      title="Portfolio preview"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                      <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-90">
                        <Palette className="h-4 w-4" /> Open Theme Studio
                      </div>
                    </div>
                  </div>
                  <div className="border-t px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Live Preview</p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className="border-dashed h-full">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <Eye className="h-7 w-7" />
                </div>
                <p className="font-semibold">Your Live Preview</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete your profile and make it public to see a live preview of your portfolio here.
                </p>
                <Link
                  href="/dashboard/profile"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Set up profile <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Share card — shown when profile is public */}
      {profile?.isPublic && profile.slug && (
        <ShareCard slug={profile.slug} />
      )}

      {/* Command palette — all nav items with keyboard hints */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Quick Actions</h2>
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
            <Command className="h-2.5 w-2.5" /> Keyboard shortcuts active
          </span>
        </div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {SHORTCUTS.map(({ key, href, label, icon: Icon }) => (
            <Link key={key} href={href}>
              <Card className="card-hover h-full group">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{label}</p>
                  </div>
                  <kbd className="hidden sm:inline-flex h-5 w-5 items-center justify-center rounded border bg-muted text-[10px] font-mono text-muted-foreground shrink-0">
                    {key}
                  </kbd>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "done":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-3 w-3" /> Parsed
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Clock className="h-3 w-3" /> Processing
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Error
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="h-3 w-3" /> Pending
        </span>
      );
  }
}
