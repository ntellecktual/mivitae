"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import PortfolioRenderer from "@/components/portfolio/portfolio-renderer";
import ShareButtons from "@/components/portfolio/share-buttons";

export default function PortfolioContent({ slug }: { slug: string }) {
  const profile = useQuery(api.profiles.getBySlug, { slug });
  const recordView = useMutation(api.analytics.recordView);
  const viewRecorded = useRef(false);

  const sections = useQuery(
    api.portfolioSections.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const education = useQuery(
    api.educationEntries.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const demos = useQuery(
    api.demos.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const skills = useQuery(
    api.skills.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const volunteering = useQuery(
    api.volunteering.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const certificates = useQuery(
    api.certificates.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );

  // Record a view once per load
  useEffect(() => {
    if (profile && profile.isPublic && !viewRecorded.current) {
      viewRecorded.current = true;
      recordView({
        profileId: profile._id,
        referrer: document.referrer || undefined,
      });
    }
  }, [profile, recordView]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (profile === null || !profile.isPublic) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg text-muted-foreground">
          This portfolio doesn&apos;t exist or is private.
        </p>
        <a
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go Home
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Floating share bar */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border bg-card/80 p-2 shadow-lg backdrop-blur-md">
        <ShareButtons slug={slug} headline={profile.headline} />
      </div>
      <PortfolioRenderer
        profile={profile}
        sections={sections ?? []}
        education={education ?? []}
        demos={demos ?? []}
        skills={skills ?? []}
        volunteering={volunteering ?? []}
        certificates={certificates ?? []}
      />
    </>
  );
}
