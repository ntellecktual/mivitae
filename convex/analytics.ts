import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserPlan, getLimits } from "./planLimits";

// ── Record a view on a public profile ──────────────────────────────────

export const recordView = mutation({
  args: {
    profileId: v.id("profiles"),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Rate limit: max 1 view per profile per 10 seconds (prevents spam)
    const tenSecondsAgo = Date.now() - 10_000;
    const recentView = await ctx.db
      .query("profileViews")
      .withIndex("by_profileId_viewedAt", (q) =>
        q.eq("profileId", args.profileId).gte("viewedAt", tenSecondsAgo)
      )
      .first();
    if (recentView) return; // Deduplicate rapid views

    // Sanitize referrer (max 500 chars, strip potential XSS)
    const referrer = args.referrer
      ? args.referrer.slice(0, 500).replace(/[<>"']/g, "")
      : undefined;

    await ctx.db.insert("profileViews", {
      profileId: args.profileId,
      viewedAt: Date.now(),
      referrer,
    });

    // Increment denormalized view counter on the profile
    const profile = await ctx.db.get(args.profileId);
    if (profile) {
      await ctx.db.patch(args.profileId, {
        viewCount: (profile.viewCount ?? 0) + 1,
      });
    }
  },
});

// ── Get total view count for a profile ─────────────────────────────────

export const getViewCount = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    return profile?.viewCount ?? 0;
  },
});

// ── Get view count for the authenticated user's profile ────────────────

export const getSelfViewCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) return null;

    return profile.viewCount ?? 0;
  },
});

// ── Get analytics breakdown (last 30 days, daily counts) ───────────────

export const getSelfAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) return null;

    // Plan enforcement: free users don't get analytics breakdown
    const plan = await getUserPlan(ctx, user._id);
    const limits = getLimits(plan);
    if (!limits.analyticsAccess) {
      return { totalViews: 0, dailyViews: [], topReferrers: [], gated: true };
    }

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const recentViews = await ctx.db
      .query("profileViews")
      .withIndex("by_profileId_viewedAt", (q) =>
        q.eq("profileId", profile._id).gte("viewedAt", thirtyDaysAgo)
      )
      .collect();

    // Group by day
    const dailyCounts: Record<string, number> = {};
    for (const view of recentViews) {
      const day = new Date(view.viewedAt).toISOString().split("T")[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    }

    // Build last 30 days array
    const days: { date: string; views: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      days.push({ date: key, views: dailyCounts[key] || 0 });
    }

    // Referrer breakdown
    const referrerCounts: Record<string, number> = {};
    for (const view of recentViews) {
      const ref = view.referrer || "Direct";
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    }
    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    return {
      totalViews: recentViews.length,
      dailyViews: days,
      topReferrers,
    };
  },
});
