import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/* ── Shared helpers ─────────────────────────────────────────────────── */

function rapidHeaders() {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY environment variable is not set");
  return {
    "x-rapidapi-host": "jsearch.p.rapidapi.com",
    "x-rapidapi-key": key,
  };
}

/* ── Search Jobs ────────────────────────────────────────────────────── */

export const search = action({
  args: {
    query: v.string(),
    page: v.optional(v.number()),
    datePosted: v.optional(
      v.union(
        v.literal("all"),
        v.literal("today"),
        v.literal("3days"),
        v.literal("week"),
        v.literal("month"),
      ),
    ),
    remoteOnly: v.optional(v.boolean()),
    employmentType: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const params = new URLSearchParams({
      query: args.query,
      page: String(args.page ?? 1),
      num_pages: "1",
    });
    if (args.datePosted && args.datePosted !== "all") {
      params.set("date_posted", args.datePosted);
    }
    if (args.remoteOnly) {
      params.set("remote_jobs_only", "true");
    }
    if (args.employmentType) {
      params.set("employment_types", args.employmentType);
    }
    if (args.country) {
      params.set("country", args.country);
    }

    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
      { headers: rapidHeaders() },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`JSearch API error ${res.status}: ${body}`);
    }
    return await res.json();
  },
});

/* ── Job Details ────────────────────────────────────────────────────── */

export const getDetails = action({
  args: { jobId: v.string() },
  handler: async (_ctx, args) => {
    const params = new URLSearchParams({ job_id: args.jobId });
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/job-details?${params.toString()}`,
      { headers: rapidHeaders() },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`JSearch API error ${res.status}: ${body}`);
    }
    return await res.json();
  },
});

/* ── Estimated Salary ───────────────────────────────────────────────── */

export const getEstimatedSalary = action({
  args: {
    jobTitle: v.string(),
    location: v.string(),
    radius: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const params = new URLSearchParams({
      job_title: args.jobTitle,
      location: args.location,
      radius: String(args.radius ?? 100),
    });
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/estimated-salary?${params.toString()}`,
      { headers: rapidHeaders() },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`JSearch API error ${res.status}: ${body}`);
    }
    return await res.json();
  },
});

/* ── Smart Search (uses profile data to build query) ────────────────── */

export const smartSearch = action({
  args: {
    page: v.optional(v.number()),
    datePosted: v.optional(
      v.union(
        v.literal("all"),
        v.literal("today"),
        v.literal("3days"),
        v.literal("week"),
        v.literal("month"),
      ),
    ),
    remoteOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get user's profile for headline + location
    const profile = await ctx.runQuery(api.profiles.getSelf, {});

    // Get user's skills
    const skills = await ctx.runQuery(api.skills.getSelfSkills, {});

    // Build a smart query from profile + skills
    const parts: string[] = [];

    if (profile?.headline) {
      parts.push(profile.headline);
    }

    // Add top skills (up to 3) for relevance
    if (skills && skills.length > 0) {
      const topSkills = skills
        .sort(
          (a: { proficiency: number }, b: { proficiency: number }) =>
            (b.proficiency ?? 0) - (a.proficiency ?? 0),
        )
        .slice(0, 3)
        .map((s: { name: string }) => s.name);
      parts.push(topSkills.join(" "));
    }

    const query = parts.join(" ") || "software developer";
    const location = profile?.location ?? "";

    const params = new URLSearchParams({
      query: location ? `${query} in ${location}` : query,
      page: String(args.page ?? 1),
      num_pages: "1",
    });
    if (args.datePosted && args.datePosted !== "all") {
      params.set("date_posted", args.datePosted);
    }
    if (args.remoteOnly) {
      params.set("remote_jobs_only", "true");
    }

    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
      { headers: rapidHeaders() },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`JSearch API error ${res.status}: ${body}`);
    }
    return await res.json();
  },
});
