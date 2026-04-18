"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Eye,
  ArrowRight,
  Sparkles,
  Users,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: undefined, label: "All" },
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "data", label: "Data" },
  { value: "product", label: "Product" },
  { value: "devops", label: "DevOps" },
  { value: "other", label: "Other" },
] as const;

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : score >= 60
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-red-400/10 text-red-500 border-red-400/20";

  return (
    <Badge className={cn("text-[10px] gap-1", color)}>
      <Shield className="h-2.5 w-2.5" />
      {score}
    </Badge>
  );
}

export default function ShowcasePage() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const entries = useQuery(api.showcase.listActive, { category });

  const loading = entries === undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Curated by the mivitae team
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Showcase
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
          Verified skill demos from professionals who prove what they can do —
          not just what they claim.
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setCategory(cat.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              category === cat.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : (entries ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {category ? "No entries in this category yet" : "Showcase coming soon"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We&apos;re curating the best portfolio demos. Create yours and it
              might be featured here.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry._id}
              href={`/${entry.profile?.slug ?? ""}`}
              className="group"
            >
              <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30">
                {/* Thumbnail or gradient placeholder */}
                <div className="relative h-36 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
                  {entry.demo?.bannerUrl && (
                    <img
                      src={entry.demo.bannerUrl}
                      alt={entry.demo.title ?? ""}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {entry.skillScore && (
                    <div className="absolute top-3 right-3">
                      <ScoreBadge score={entry.skillScore.overallScore} />
                    </div>
                  )}
                  {entry.category && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {entry.category}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-5">
                  {/* Person */}
                  <div className="flex items-center gap-3 mb-3">
                    {entry.profile?.avatarUrl ? (
                      <img
                        src={entry.profile.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                        {(entry.userName ?? "?")[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {entry.userName}
                      </p>
                      {entry.profile?.headline && (
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.profile.headline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Demo info */}
                  {entry.demo && (
                    <div className="mb-3">
                      <p className="text-sm font-medium">{entry.demo.title}</p>
                      {entry.demo.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {entry.demo.description}
                        </p>
                      )}
                      {entry.demo.tags && entry.demo.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.demo.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Curator note */}
                  {entry.curatorNote && (
                    <p className="text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2">
                      &ldquo;{entry.curatorNote}&rdquo;
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {entry.profile?.viewCount ?? 0} views
                    </span>
                    <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View profile
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
