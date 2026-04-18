import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { cascadeDeleteUserData } from "./account";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Auth guard: callers can only look up their own record
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkId) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    // Auto-grant founding plan to first 10 users
    const existingUsers = await ctx.db.query("users").take(10);
    const isFoundingUser = existingUsers.length < 10;

    const newId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
      ...(isFoundingUser ? { isFoundingUser: true } : {}),
    });
    // Auto-generate a referral code for every new user
    await ctx.runMutation(internal.referrals.ensureCode, { userId: newId });
    return newId;
  },
});

export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (user) {
      // Full cascade delete — storage files, teams, referrals, everything
      await cascadeDeleteUserData(ctx, user._id);
    }
  },
});

/**
 * Client-callable upsert — syncs the authenticated Clerk session into Convex.
 * Called once on load from providers.tsx as a webhook fallback (works in local dev
 * where webhooks can't reach localhost).
 */
export const upsertSelf = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const email =
      identity.email ??
      (typeof identity.tokenIdentifier === "string"
        ? identity.tokenIdentifier
        : "unknown@unknown.com");

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        firstName: identity.givenName ?? existing.firstName,
        lastName: identity.familyName ?? existing.lastName,
        imageUrl: identity.pictureUrl ?? existing.imageUrl,
      });
      return existing._id;
    }

    const newId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email,
      firstName: identity.givenName,
      lastName: identity.familyName,
      imageUrl: identity.pictureUrl,
      createdAt: Date.now(),
    });
    // Ensure referral code (mirrors webhook path)
    await ctx.runMutation(internal.referrals.ensureCode, { userId: newId });
    return newId;
  },
});
