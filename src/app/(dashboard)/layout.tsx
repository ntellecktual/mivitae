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
} from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorBoundary } from "@/components/error-boundary";

const GuidedTour = lazy(() =>
  import("@/components/guided-tour").then((m) => ({ default: m.GuidedTour }))
);

/* ── Sidebar navigation groups ─────────────────────────────────────── */
const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
      { href: "/dashboard/demos", label: "Demos", icon: Zap },
      { href: "/dashboard/github", label: "GitHub Import", icon: GitBranch },
      { href: "/dashboard/profile", label: "Profile", icon: User },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/dashboard/theme", label: "Theme Studio", icon: Palette },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/clicks", label: "Click Tracking", icon: MousePointerClick },
      { href: "/dashboard/export", label: "Export PDF", icon: FileDown },
      { href: "/dashboard/referrals", label: "Refer & Earn", icon: Gift },
      { href: "/dashboard/team", label: "Team", icon: Users },
    ],
  },
];

/* ── Sidebar content (shared between desktop & mobile) ─────────────── */
function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user } = useUser();
  const isAdmin = useQuery(api.admin.isAdmin);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-5">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80" onClick={onNavigate}>
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
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors duration-200",
                        isActive
                          ? "text-primary"
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
          </div>
        )}
      </nav>

      {/* Bottom: Settings + User Profile */}
      <div className="mt-auto border-t border-sidebar-border px-3 py-3">
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

        <Separator className="my-2 opacity-50" />

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <UserButton />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.firstName ?? "Account"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
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
  const onboardingState = useQuery(api.onboarding.getSelf);

  // Gate: redirect to onboarding if not complete (and not already there)
  const isOnboarding = pathname === "/dashboard/onboarding";
  useEffect(() => {
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
  }, [onboardingState, isOnboarding, router]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // During onboarding, show a minimal layout without sidebar navigation
  if (isOnboarding || (onboardingState !== undefined && !onboardingState?.isComplete)) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <Link href="/" className="flex items-center">
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
          <ThemeToggle />
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
        <Suspense fallback={null}>
          <GuidedTour />
        </Suspense>
      </div>
    </div>
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
