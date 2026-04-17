"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import Link from "next/link";
import { MapPin, Eye } from "lucide-react";

export default function GalleryPage() {
  const profiles = useQuery(api.profiles.listPublicGallery);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Portfolio Gallery
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover portfolios built by professionals on mivitae. Get inspired
          and create your own.
        </p>
      </div>

      {profiles === undefined && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {profiles && profiles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No public portfolios yet. Be the first!</p>
          <Link
            href="/sign-up"
            className="mt-4 inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Create Your Portfolio
          </Link>
        </div>
      )}

      {profiles && profiles.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <Link
              key={p.slug}
              href={`/u/${p.slug}`}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
            >
              <div className="flex items-start gap-4">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg ring-2 ring-border">
                    {p.headline?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                    {p.headline}
                  </h2>
                  {p.location && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {p.location}
                    </p>
                  )}
                </div>
              </div>
              {p.bio && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {p.bio}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {p.viewCount} views
                </span>
                <span className="text-primary font-medium group-hover:underline">
                  View portfolio &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
