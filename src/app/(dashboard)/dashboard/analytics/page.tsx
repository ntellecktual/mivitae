"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  TrendingUp,
  Globe,
  ArrowRight,
  Lock,
  BarChart3,
  Sparkles,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────

function ViewsBarChart({ data }: { data: { date: string; views: number }[] }) {
  const max = Math.max(...data.map((d) => d.views), 1);
  const BAR_W = 10;
  const GAP = 3;
  const CHART_H = 160;
  const totalW = data.length * (BAR_W + GAP) - GAP;

  const gridLines = [0.25, 0.5, 0.75, 1];
  const labelIndices = [0, 6, 13, 20, 27, 29];

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${totalW} ${CHART_H}`}
        className="w-full"
        style={{ height: CHART_H }}
        aria-label="30-day profile views"
      >
        {gridLines.map((pct) => (
          <line
            key={pct}
            x1={0}
            y1={CHART_H * (1 - pct)}
            x2={totalW}
            y2={CHART_H * (1 - pct)}
            stroke="currentColor"
            strokeOpacity={0.07}
            strokeWidth={1}
          />
        ))}

        {data.map((d, i) => {
          const barH = Math.max((d.views / max) * CHART_H, d.views > 0 ? 4 : 0);
          return (
            <rect
              key={d.date}
              x={i * (BAR_W + GAP)}
              y={CHART_H - barH}
              width={BAR_W}
              height={barH}
              rx={2}
              className={cn(
                "transition-opacity",
                barH > 0 ? "fill-primary" : "fill-muted"
              )}
              fillOpacity={barH > 0 ? 0.8 : 0.2}
            >
              <title>
                {d.date}: {d.views} view{d.views !== 1 ? "s" : ""}
              </title>
            </rect>
          );
        })}
      </svg>

      <div className="relative mt-1" style={{ height: 16 }}>
        {data.map((d, i) => {
          if (!labelIndices.includes(i)) return null;
          const pct = (i * (BAR_W + GAP)) / totalW;
          return (
            <span
              key={d.date}
              className="absolute -translate-x-1/2 text-[10px] text-muted-foreground"
              style={{ left: `${pct * 100}%` }}
            >
              {fmt(d.date)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Referrer Row ──────────────────────────────────────────────────────────────

function ReferrerRow({
  source,
  count,
  total,
  rank,
}: {
  source: string;
  count: number;
  total: number;
  rank: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const label =
    source === "Direct"
      ? "Direct / bookmark"
      : source.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];

  return (
    <div className="flex items-center gap-3">
      <span className="w-4 shrink-0 text-right text-xs text-muted-foreground">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="truncate text-sm font-medium">{label}</span>
          <span className="ml-2 shrink-0 text-sm text-muted-foreground">
            {count}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/60 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Upgrade gate ──────────────────────────────────────────────────────────────

function AnalyticsGate() {
  return (
    <div className="flex flex-col items-center gap-10 py-16 text-center">
      {/* Illustration */}
      <div className="relative">
        {/* Decorative blurred rings */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
        </div>
        {/* Fake chart preview (blurred) */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg w-80 blur-[2px] select-none pointer-events-none">
          <div className="mb-4 flex items-center justify-between">
            <span className="h-4 w-24 rounded bg-muted animate-pulse" />
            <span className="h-3.5 w-16 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {[30, 55, 40, 70, 45, 90, 60, 75, 50, 85, 65, 95, 70, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-primary/30"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[120, 48, 12].map((n, i) => (
              <div key={i} className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-lg font-bold text-foreground/30">{n}</p>
                <p className="text-[10px] text-muted-foreground/50">views</p>
              </div>
            ))}
          </div>
        </div>
        {/* Lock badge */}
        <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary shadow-md">
          <Lock className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>

      {/* Text */}
      <div className="max-w-sm">
        <h2 className="text-2xl font-bold tracking-tight">Unlock your analytics</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          See exactly who&apos;s viewing your portfolio, where they&apos;re coming from, and
          which days get the most traffic. Analytics is included on Pro and Team.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { icon: BarChart3, label: "30-day view history" },
          { icon: Globe, label: "Traffic source breakdown" },
          { icon: TrendingUp, label: "Week-over-week trend" },
          { icon: Sparkles, label: "Best-day insights" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium"
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
            {label}
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
      >
        <Rocket className="h-4 w-4" />
        Upgrade to Pro
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "card-hover transition-all",
        accent ? "border-primary/30 bg-primary/5" : ""
      )}
    >
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            accent
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium">{label}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useUser();
  const selfPlan = useQuery(api.subscriptions.getSelfPlan);
  const subscription = useQuery(api.subscriptions.getSelf);
  const allTimeViews = useQuery(api.analytics.getSelfViewCount);
  const analytics = useQuery(api.analytics.getSelfAnalytics);

  const hasAccess =
    selfPlan == null || // null (auth not propagated yet) or undefined (query loading)
    selfPlan.isCreator ||
    selfPlan.isFoundingUser ||
    selfPlan.plan === "pro" ||
    selfPlan.plan === "team";

  const isGated =
    !hasAccess ||
    (analytics !== undefined &&
      analytics !== null &&
      (analytics as any).gated === true);

  if (isGated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Track who&apos;s viewing your portfolio
          </p>
        </div>
        <AnalyticsGate />
      </div>
    );
  }

  const loading = analytics === undefined;
  const data = analytics ?? null;

  const totalThirty = data?.totalViews ?? 0;
  const dailyViews = data?.dailyViews ?? [];
  const topReferrers = data?.topReferrers ?? [];

  const bestDay = dailyViews.reduce<{ date: string; views: number } | null>(
    (best, d) => (!best || d.views > best.views ? d : best),
    null
  );

  const last7 = dailyViews.slice(-7).reduce((s, d) => s + d.views, 0);
  const prior7 = dailyViews.slice(-14, -7).reduce((s, d) => s + d.views, 0);
  const weekTrend =
    prior7 > 0 ? Math.round(((last7 - prior7) / prior7) * 100) : null;

  const firstName = user?.firstName ?? "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Last 30 days
            {firstName ? ` · ${firstName}'s portfolio` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selfPlan?.isCreator && (
            <Badge className="bg-primary/10 text-primary border-primary/30">
              Creator — full access
            </Badge>
          )}
          {!selfPlan?.isCreator && subscription?.status === "trialing" && (
            <Badge variant="secondary">Trial — analytics included</Badge>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Views (30 days)"
          value={loading ? "—" : totalThirty}
          sub={
            weekTrend !== null
              ? `${weekTrend >= 0 ? "+" : ""}${weekTrend}% vs. prior week`
              : undefined
          }
          icon={Eye}
          accent
        />
        <StatCard
          label="All-time views"
          value={allTimeViews === undefined ? "—" : (allTimeViews ?? 0)}
          icon={Globe}
        />
        <StatCard
          label="Best day (30d)"
          value={loading || !bestDay || bestDay.views === 0 ? "—" : bestDay.views}
          sub={
            bestDay && bestDay.views > 0
              ? new Date(bestDay.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "No views yet"
          }
          icon={TrendingUp}
        />
      </div>

      {/* Chart — borderless, full width */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Daily views</h2>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        {loading ? (
          <div className="h-[176px] animate-pulse rounded-xl bg-muted" />
        ) : dailyViews.length > 0 ? (
          <ViewsBarChart data={dailyViews} />
        ) : (
          <div className="flex h-[176px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No view data yet — share your portfolio to start tracking.
          </div>
        )}
      </div>

      <Separator />

      {/* Bottom grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic sources */}
        <div>
          <h2 className="mb-5 text-base font-semibold">Top traffic sources</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : topReferrers.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <Globe className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No referrer data yet. Share your portfolio link to start seeing traffic sources.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topReferrers.map((r, i) => (
                <ReferrerRow
                  key={r.source}
                  source={r.source}
                  count={r.count}
                  total={totalThirty}
                  rank={i + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div>
          <h2 className="mb-5 text-base font-semibold">Tips to grow views</h2>
          <div className="space-y-1">
            {[
              { tip: "Add your portfolio link to your LinkedIn headline", impact: "High" },
              { tip: "Include the link in your email signature", impact: "High" },
              { tip: "Share on relevant subreddits or Slack communities", impact: "Medium" },
              { tip: "Pin a portfolio post on social media", impact: "Medium" },
              { tip: "Update your GitHub profile README with your portfolio", impact: "Medium" },
            ].map(({ tip, impact }) => (
              <div
                key={tip}
                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    impact === "High"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {impact}
                </span>
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trial upgrade nudge */}
      {subscription?.status === "trialing" && (
        <>
          <Separator />
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div>
              <p className="font-semibold">Love your analytics?</p>
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro to keep tracking views after your trial ends.
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Upgrade
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
