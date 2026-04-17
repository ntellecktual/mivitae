"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MousePointerClick, ExternalLink, TrendingUp, BarChart3 } from "lucide-react";

export default function ClickTrackingPage() {
  const analytics = useQuery(api.clickEvents.getClickAnalytics);

  const totalClicks = analytics?.dailyCounts.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Click Tracking</h1>
        <p className="text-muted-foreground">
          See how visitors interact with your public portfolio over the last 30 days.
        </p>
      </div>

      {!analytics ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MousePointerClick className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      ) : totalClicks === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MousePointerClick className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No clicks recorded in the last 30 days.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Share your portfolio link to start tracking engagement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalClicks}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Click Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.byType.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unique Targets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.topTargets.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* By type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" /> Clicks by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.byType.map(({ type, count }) => {
                  const pct = Math.round((count / totalClicks) * 100);
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize">{type.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ExternalLink className="h-4 w-4" /> Top Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topTargets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No target data.</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topTargets.map(({ target, count }, i) => (
                    <div
                      key={target}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          #{i + 1}
                        </Badge>
                        <span className="truncate">{target}</span>
                      </div>
                      <span className="text-muted-foreground shrink-0">
                        {count} clicks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" /> Daily Trend (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-[2px] h-32">
                {analytics.dailyCounts.map(({ date, count }) => {
                  const max = Math.max(...analytics.dailyCounts.map((d) => d.count), 1);
                  const heightPct = Math.max((count / max) * 100, 2);
                  return (
                    <div
                      key={date}
                      className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors"
                      style={{ height: `${heightPct}%` }}
                      title={`${date}: ${count} clicks`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{analytics.dailyCounts[0]?.date ?? ""}</span>
                <span>{analytics.dailyCounts[analytics.dailyCounts.length - 1]?.date ?? ""}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
