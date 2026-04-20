"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Upload,
  Briefcase,
  GraduationCap,
  Zap,
  User,
  Palette,
  BarChart3,
  Settings,
  Menu,
  X,
  Clock,
  Gift,
  Users,
  Bell,
  Mail,
  Wrench,
  Heart,
  MousePointerClick,
  Shield,
  GitBranch,
  FileDown,
  Sparkles,
  HelpCircle,
  Crown,
  Search,
  Rocket,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/lib/convex";
import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorBoundary } from "@/components/error-boundary";
import { GuidedTour, useTour, TOUR_SECTIONS } from "@/components/guided-tour";

/* ── Sidebar navigation groups ─────────────────────────────────────── */
const navSections = [
  {
    label: "You",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/profile", label: "Profile", icon: User },
      { href: "/dashboard/upload", label: "Upload Resume", icon: Upload },
      { href: "/dashboard/messages", label: "Messages", icon: Mail },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { href: "/dashboard/portfolio", label: "Work History", icon: Briefcase },
      { href: "/dashboard/education", label: "Education", icon: GraduationCap },
      { href: "/dashboard/skills", label: "Skills", icon: Wrench },
      { href: "/dashboard/volunteering", label: "Volunteering", icon: Heart },
    ],
  },
  {
    label: "Design",
    items: [
      { href: "/dashboard/theme", label: "Theme Studio", icon: Palette },
    ],
  },
  {
    label: "Showcase",
    items: [
      { href: "/dashboard/demos", label: "Demos", icon: Zap },
      { href: "/dashboard/github", label: "GitHub Import", icon: GitBranch },
    ],
  },
  {
    label: "Career",
    items: [
      { href: "/dashboard/jobs", label: "Job Search", icon: Search },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/dashboard/skill-scores", label: "Skill Scores", icon: Shield },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/clicks", label: "Click Tracking", icon: MousePointerClick },
      { href: "/dashboard/export", label: "Export PDF", icon: FileDown },
      { href: "/dashboard/referrals", label: "Refer & Earn", icon: Gift },
      { href: "/dashboard/team", label: "Team", icon: Users },
    ],
  },
];

/* ── Guide button with section picker ─────────────────────────────── */

function GuideButton({ onNavigate }: { onNavigate?: () => void }) {
  const { startTour, startFullTour } = useTour();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
      >
        <HelpCircle className="h-4 w-4 shrink-0" />
        Guide
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-56 rounded-lg border bg-popover p-1.5 shadow-xl animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => {
              startFullTour();
              setOpen(false);
              onNavigate?.();
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Full Tour
          </button>
          <div className="my-1 h-px bg-border" />
          {TOUR_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                startTour(section.id);
                setOpen(false);
                onNavigate?.();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {section.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sidebar content (shared between desktop & mobile) ─────────────── */
function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(api.admin.isAdmin);
  const selfPlan = useQuery(api.subscriptions.getSelfPlan);
  // selfPlan is undefined while loading, null when Convex has no auth yet,
  // and an object once auth is confirmed and the query resolves.
  // planReady = we have a confirmed, auth-backed plan value.
  const planReady = isAuthenticated && selfPlan != null;
  const isFoundingUser = planReady ? selfPlan.isFoundingUser : false;

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-5">
        <Link href="/dashboard" className="flex items-center transition-opacity hover:opacity-80" onClick={onNavigate}>
          <Image
            src="/logo-light.png"
            alt="mivitae"
            width={100}
            height={30}
            className="block dark:hidden"
            priority
          />
          <Image
            src="/logo-dark.png"
            alt="mivitae"
            width={100}
            height={30}
            className="hidden dark:block"
            priority
          />
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navSections.map((section, idx) => (
          <div key={section.label} className={cn(idx > 0 && "mt-6")}>
            <p className={cn(
              "mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider",
              section.label === "Design"
                ? "bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent"
                : "text-muted-foreground/70"
            )}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href + "/"));
                const isThemeStudio = item.href === "/dashboard/theme";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? isThemeStudio
                          ? "bg-gradient-to-r from-primary/15 to-violet-500/15 text-primary shadow-sm ring-1 ring-primary/20"
                          : "bg-primary/10 text-primary shadow-sm"
                        : isThemeStudio
                          ? "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-violet-500/10 hover:text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors duration-200",
                        isActive
                          ? "text-primary"
                          : isThemeStudio
                            ? "text-muted-foreground/60 group-hover:text-primary"
                            : "text-muted-foreground/60 group-hover:text-foreground"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin link (only for superadmins) */}
        {isAdmin && (
          <div className="mt-6">
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Admin
            </p>
            <Link
              href="/dashboard/admin"
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Shield
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-200",
                  pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")
                    ? "text-primary"
                    : "text-muted-foreground/60 group-hover:text-foreground"
                )}
              />
              Admin
            </Link>
            <Link
              href="/dashboard/onboarding"
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                pathname === "/dashboard/onboarding"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Rocket
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-200",
                  pathname === "/dashboard/onboarding"
                    ? "text-primary"
                    : "text-muted-foreground/60 group-hover:text-foreground"
                )}
              />
              Preview Onboarding
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom: Upgrade CTA + Settings + User Profile */}
      <div className="mt-auto border-t border-sidebar-border px-3 py-3">
        {/* Upgrade CTA — only shown once plan is confirmed AND user is on free tier.
            planReady guards against stale cache and unauthenticated Convex snapshots
            flashing "free" before the real subscription data arrives. */}
        {planReady && selfPlan.plan === "free" && !selfPlan.isCreator && (
          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            className="group mb-1.5 flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary/15 via-primary/10 to-violet-500/15 px-3 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-all duration-200 hover:from-primary/25 hover:via-primary/20 hover:to-violet-500/25 hover:ring-primary/40 hover:shadow-md"
          >
            <Crown className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            Upgrade
          </Link>
        )}

        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
            pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/")
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>

        <GuideButton onNavigate={onNavigate} />

        <Separator className="my-2 opacity-50" />

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          {isUserLoaded ? (
            <UserButton />
          ) : (
            <div className="h-7 w-7 animate-pulse rounded-full bg-muted shrink-0" />
          )}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              {isUserLoaded ? (
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.firstName ?? "Account"}
                </p>
              ) : (
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              )}
              {/* Badge only renders once we have confirmed plan data — never flashes in */}
              {planReady && isFoundingUser && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 shrink-0">
                  <Sparkles className="h-2.5 w-2.5" />
                  Founding
                </span>
              )}
            </div>
            {isUserLoaded ? (
              <p className="truncate text-xs text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            ) : (
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            )}
          </div>
          <ThemeToggle className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const onboardingState = useQuery(api.onboarding.getSelf);

  // Gate: redirect to onboarding if not complete (and not already there).
  // Only act once Convex auth is confirmed — onboardingState is null while
  // Clerk's token hasn't propagated yet, which would cause a spurious redirect
  // to /dashboard/onboarding (and then back to /dashboard) on every refresh.
  const isOnboarding = pathname === "/dashboard/onboarding";
  const { user } = useUser();
  const isSuperAdmin = user?.id === "user_3CW4IYOWilTTTrhF3vnAQMZ9tkx";
  useEffect(() => {
    // Don't redirect while auth is still initializing
    if (isAuthLoading || !isAuthenticated) return;
    // Superadmin can visit any route without being gated by onboarding
    if (isSuperAdmin) return;

    if (
      onboardingState !== undefined &&
      onboardingState !== null &&
      !onboardingState.isComplete &&
      !isOnboarding
    ) {
      router.replace("/dashboard/onboarding");
    }
    // New users without onboarding state yet — also redirect
    if (onboardingState === null && !isOnboarding) {
      router.replace("/dashboard/onboarding");
    }
  }, [onboardingState, isOnboarding, router, isAuthenticated, isAuthLoading, isSuperAdmin]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // During onboarding, show a minimal layout without sidebar navigation.
  // Only switch to minimal layout once auth is confirmed — while auth is still
  // loading, onboardingState is null (no identity) which would incorrectly
  // trigger the minimal layout on every refresh.
  // Theme Studio takes over the entire viewport — no sidebar, no topbar.
  const isThemeStudio = pathname === "/dashboard/theme";
  if (isThemeStudio) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  const showOnboardingLayout =
    !isSuperAdmin &&
    (isOnboarding ||
      (isAuthenticated && onboardingState !== undefined && !onboardingState?.isComplete));
  if (showOnboardingLayout) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo-light.png"
              alt="mivitae"
              width={100}
              height={30}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="mivitae"
              width={100}
              height={30}
              className="hidden dark:block"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </header>
        <main className="mx-auto max-w-3xl p-4 lg:p-8 animate-fade-in">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  return (
    <GuidedTour>
    <div className="flex min-h-screen">
      {/* Desktop Sidebar — sticky, full viewport height */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 flex h-screen flex-col border-r border-sidebar-border bg-sidebar">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute right-3 top-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-h-screen">
        {/* Topbar — sticky */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle className="hidden lg:inline-flex" />
          </div>
        </header>

        {/* Trial Banner */}
        <TrialBanner />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
    </GuidedTour>
  );
}

function NotificationBell() {
  const count = useQuery(api.notifications.getUnreadCount);
  const hasUnread = typeof count === "number" && count > 0;

  return (
    <Link
      href="/dashboard/notifications"
      className="relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      aria-label={`Notifications${hasUnread ? ` (${count} unread)` : ""}`}
    >
      <Bell className="h-4 w-4" />
      {hasUnread && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

function TrialBanner() {
  const subscription = useQuery(api.subscriptions.getSelf);

  if (!subscription || subscription.status !== "trialing") return null;

  const now = Date.now();
  const endMs = subscription.currentPeriodEnd * 1000;
  const daysLeft = Math.max(0, Math.ceil((endMs - now) / (1000 * 60 * 60 * 24)));

  if (daysLeft > 30) return null; // trial just started, don't nag

  const isUrgent = daysLeft <= 3;
  const isWarning = daysLeft <= 7 && daysLeft > 3;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-2 text-sm",
        isUrgent
          ? "bg-destructive/10 text-destructive border-b border-destructive/20"
          : isWarning
            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-b border-yellow-500/20"
            : "bg-primary/5 text-primary border-b border-primary/10"
      )}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          {daysLeft === 0
            ? "Your free trial ends today."
            : `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`}{" "}
          Upgrade to keep full access.
        </span>
      </div>
      <Link
        href="/dashboard/settings"
        className={cn(
          "shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors",
          isUrgent
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : isWarning
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        Upgrade Now
      </Link>
    </div>
  );
}
