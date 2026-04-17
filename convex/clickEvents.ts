import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const recordClick = mutation({
  args: {
    profileId: v.id("profiles"),
    eventType: v.string(),
    target: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Rate limit: max 100 events per profile per minute (basic spam protection)
    const oneMinuteAgo = Date.now() - 60_000;
    const recentEvents = await ctx.db
      .query("clickEvents")
      .withIndex("by_profileId_timestamp", (q) =>
        q.eq("profileId", args.profileId).gte("timestamp", oneMinuteAgo)
      )
      .take(101);
    if (recentEvents.length >= 100) return null;

    // Sanitize target to prevent storing malicious URLs
    let sanitizedTarget = args.target?.slice(0, 500);
    if (sanitizedTarget) {
      const lower = sanitizedTarget.toLowerCase().trim();
      if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
        sanitizedTarget = undefined;
      }
    }

    return await ctx.db.insert("clickEvents", {
      profileId: args.profileId,
      eventType: args.eventType.slice(0, 50),
      target: sanitizedTarget,
      referrer: args.referrer?.slice(0, 500),
      timestamp: Date.now(),
    });
  },
});

export const getClickAnalytics = query({
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

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const events = await ctx.db
      .query("clickEvents")
      .withIndex("by_profileId_timestamp", (q) =>
        q.eq("profileId", profile._id).gte("timestamp", thirtyDaysAgo)
      )
      .take(5000);

    // Aggregate by event type
    const byType: Record<string, number> = {};
    const byTarget: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    for (const event of events) {
      byType[event.eventType] = (byType[event.eventType] ?? 0) + 1;
      if (event.target) {
        byTarget[event.target] = (byTarget[event.target] ?? 0) + 1;
      }
      const day = new Date(event.timestamp).toISOString().slice(0, 10);
      dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
    }

    // Sort targets by count, take top 20
    const topTargets = Object.entries(byTarget)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([target, count]) => ({ target, count }));

    // Convert maps to sorted arrays for the frontend
    const byTypeArray = Object.entries(byType)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    const dailyCountsArray = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return {
      totalClicks: events.length,
      byType: byTypeArray,
      topTargets,
      dailyCounts: dailyCountsArray,
    };
  },
});

// Cleanup old click events (older than 90 days)
export const cleanupOldEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const oldEvents = await ctx.db
      .query("clickEvents")
      .withIndex("by_profileId_timestamp")
      .take(500);

    let deleted = 0;
    for (const event of oldEvents) {
      if (event.timestamp < ninetyDaysAgo) {
        await ctx.db.delete(event._id);
        deleted++;
      }
    }
    return deleted;
  },
});
