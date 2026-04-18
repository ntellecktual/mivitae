import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUser, ensureAuthUser } from "./authHelpers";
import { CREATOR_CLERK_IDS } from "./planLimits";

// ── Public: list active showcase entries ───────────────────────────────

export const listActive = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let entries;

    if (args.category) {
      entries = await ctx.db
        .query("showcaseEntries")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(50);
      entries = entries.filter((e) => e.isActive);
    } else {
      entries = await ctx.db
        .query("showcaseEntries")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .take(50);
    }

    // Enrich with profile + demo data
    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const profile = await ctx.db.get(entry.profileId);
        const user = await ctx.db.get(entry.userId);
        const demo = entry.demoId ? await ctx.db.get(entry.demoId) : null;

        // Get skill score for the demo if present
        let skillScore = null;
        if (entry.demoId) {
          skillScore = await ctx.db
            .query("skillScores")
            .withIndex("by_demoId", (q) => q.eq("demoId", entry.demoId!))
            .unique();
        }

        return {
          _id: entry._id,
          featuredAt: entry.featuredAt,
          category: entry.category,
          curatorNote: entry.curatorNote,
          profile: profile
            ? {
                headline: profile.headline,
                slug: profile.slug,
                avatarUrl: profile.avatarUrl,
                viewCount: profile.viewCount ?? 0,
              }
            : null,
          demo: demo
            ? {
                title: demo.title,
                description: demo.description,
                tags: demo.tags,
                bannerUrl: demo.bannerUrl,
              }
            : null,
          skillScore: skillScore
            ? { overallScore: skillScore.overallScore }
            : null,
          userName: user
            ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
            : null,
        };
      }),
    );

    // Sort by featuredAt descending
    return enriched
      .filter((e) => e.profile !== null)
      .sort((a, b) => b.featuredAt - a.featuredAt);
  },
});

// ── Admin: feature a profile/demo in the showcase ─────────────────────

export const featureEntry = mutation({
  args: {
    userId: v.id("users"),
    profileId: v.id("profiles"),
    demoId: v.optional(v.id("userDemos")),
    category: v.optional(v.string()),
    curatorNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (!CREATOR_CLERK_IDS.has(identity.subject)) {
      throw new Error("Only admins can feature showcase entries");
    }

    return await ctx.db.insert("showcaseEntries", {
      userId: args.userId,
      profileId: args.profileId,
      demoId: args.demoId,
      category: args.category,
      curatorNote: args.curatorNote
        ? args.curatorNote.slice(0, 500)
        : undefined,
      featuredAt: Date.now(),
      isActive: true,
    });
  },
});

// ── Admin: remove from showcase ───────────────────────────────────────

export const removeEntry = mutation({
  args: { id: v.id("showcaseEntries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (!CREATOR_CLERK_IDS.has(identity.subject)) {
      throw new Error("Only admins can remove showcase entries");
    }

    await ctx.db.patch(args.id, { isActive: false });
  },
});
