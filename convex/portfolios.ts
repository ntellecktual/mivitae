import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const getSelf = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("portfolios")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});

/** Creates the user's default portfolio if one doesn't exist. Safe to call multiple times. */
export const ensureDefault = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("portfolios")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (existing) return existing._id;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) throw new Error("Complete your profile before setting up your portfolio.");

    return await ctx.db.insert("portfolios", {
      userId: user._id,
      profileId: profile._id,
      title: "My Portfolio",
      isDefault: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Internal version for use by resumeParser action (accepts userId directly)
export const ensureDefaultInternal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("portfolios")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) return existing._id;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    // If no profile yet, create a minimal one with a placeholder slug
    const profileId = profile
      ? profile._id
      : await ctx.db.insert("profiles", {
          userId: args.userId,
          slug: `user-${args.userId.slice(-8)}`,
          isPublic: false,
        });

    return await ctx.db.insert("portfolios", {
      userId: args.userId,
      profileId,
      title: "My Portfolio",
      isDefault: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
