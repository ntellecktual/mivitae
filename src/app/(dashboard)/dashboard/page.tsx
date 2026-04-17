"use client";

import Link from "next/link";
import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      <CardContent className="p-6">
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
  const subscription = useQuery(api.subscriptions.getSelf);
  const referralStats = useQuery(api.referrals.getMyStats);

  const firstName = user?.firstName ?? "there";

  // Wait for primary queries to avoid layout shift
  if (profile === undefined || subscription === undefined) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="h-9 w-64 rounded-lg bg-muted animate-shimmer-pulse" />
          <div className="mt-2 h-5 w-80 rounded-lg bg-muted animate-shimmer-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border bg-muted animate-shimmer-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl border bg-muted animate-shimmer-pulse" style={{ animationDelay: `${(i + 3) * 150}ms` }} />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border bg-muted animate-shimmer-pulse" style={{ animationDelay: `${(i + 5) * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  const showOnboardingBanner =
    onboardingState !== undefined && onboardingState !== null && !onboardingState.isComplete;

  const { score, items: completionItems } = calcCompletion(profile);
  const incomplete = completionItems.filter((i) => !i.done);

  return (
    <div className="space-y-8">
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

      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          Here&apos;s an overview of your living portfolio.
        </p>
      </div>

      {/* Share card — shown when profile is public */}
      {profile?.isPublic && profile.slug && (
        <ShareCard slug={profile.slug} />
      )}

      {/* Stats bento grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile views */}
        <Link href="/dashboard/analytics">
          <Card className="card-hover overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</span>
              </div>
              <p className="text-4xl font-bold tracking-tight tabular-nums">{viewCount ?? "—"}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Profile views all time</p>
              {/* Mini bar chart */}
              <div className="mt-4 flex items-end gap-0.5 h-8">
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

        {/* Completion score */}
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Strength</span>
              <span className="text-xs font-semibold text-primary">{score}%</span>
            </div>
            {/* Large ring */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={1}
                    strokeWidth="2.5"
                    strokeDasharray={`${(score / 100) * 94.25} 94.25`}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-700"
                  />
                </svg>
                <span className="absolute text-sm font-bold">{score}</span>
              </div>
              <div>
                <p className="font-semibold">Profile strength</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {score === 100
                    ? "Fully optimized"
                    : `${incomplete.length} item${incomplete.length !== 1 ? "s" : ""} remaining`}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${score}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resume status */}
        {latestResume ? (
          <Link href="/dashboard/upload">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <StatusBadge status={latestResume.parseStatus} />
                </div>
                <p className="truncate font-semibold">{latestResume.fileName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Uploaded {new Date(latestResume.uploadedAt).toLocaleDateString()}
                </p>
                <p className="mt-3 text-xs text-primary font-medium">Upload a new version →</p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Link href="/dashboard/upload">
            <Card className="card-hover border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[172px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="font-semibold text-sm">Upload resume</p>
                <p className="mt-0.5 text-xs text-muted-foreground">AI parses your career in ~30s</p>
                <ArrowRight className="mt-3 h-4 w-4 text-primary" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Plan & Referral row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Plan status */}
        <Link href="/dashboard/settings">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                {(!subscription || subscription.plan === "free") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    <TrendingUp className="h-3 w-3" /> Upgrade
                  </span>
                )}
              </div>
              <p className="text-lg font-semibold capitalize">
                {subscription?.plan ?? "Free"} plan
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {subscription?.status === "trialing" ? (
                  <>
                    Trial ends{" "}
                    {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                  </>
                ) : subscription?.status === "active" ? (
                  <>Active · renews {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}</>
                ) : (
                  "Upgrade for unlimited features"
                )}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Referral stats */}
        <Link href="/dashboard/referrals">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Gift className="h-5 w-5" />
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">Referrals</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {referralStats
                  ? `${referralStats.total} invited · ${referralStats.credits} credit${referralStats.credits !== 1 ? "s" : ""} earned`
                  : "Invite friends, earn credits"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Completion checklist — only show if not 100% */}
      {score < 100 && incomplete.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Complete your profile</h2>
              <span className="text-sm text-muted-foreground">{score}% done</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted mb-5">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="space-y-2">
              {completionItems.map(({ label, done, href }) => (
                <Link
                  key={label}
                  href={done ? "#" : href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    done
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-muted"
                  )}
                >
                  <CheckCircle
                    className={cn(
                      "h-4 w-4 shrink-0",
                      done ? "text-green-500" : "text-muted-foreground/40"
                    )}
                  />
                  <span className={done ? "line-through" : ""}>{label}</span>
                  {!done && (
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Quick actions</h2>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <QuickCard href="/dashboard/portfolio" icon={Briefcase} title="Work History" description="Edit your career timeline" />
          <QuickCard href="/dashboard/education" icon={GraduationCap} title="Education" description="Degrees & certifications" />
          <QuickCard href="/dashboard/demos" icon={Zap} title="Demos" description="Interactive showcases" />
          <QuickCard href="/dashboard/profile" icon={User} title="Profile Info" description="Bio, links, and settings" />
          <QuickCard href="/dashboard/theme" icon={Palette} title="Theme Studio" description="Customize your look" />
          <QuickCard href="/dashboard/analytics" icon={BarChart3} title="Analytics" description="See who's viewing you" />
          <QuickCard href="/dashboard/referrals" icon={Gift} title="Referrals" description="Invite & earn credits" />
          <QuickCard href="/dashboard/settings" icon={CreditCard} title="Settings" description="Plan, billing & account" />
        </div>
      </div>
    </div>
  );
}

function QuickCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="card-hover h-full">
        <CardContent className="flex flex-col items-center justify-center p-5 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
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
