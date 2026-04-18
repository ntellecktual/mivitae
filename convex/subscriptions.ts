import { v } from "convex/values";
import { query, internalMutation, internalQuery } from "./_generated/server";
import { CREATOR_CLERK_IDS, FOUNDING_CLERK_IDS } from "./planLimits";
import type { PlanId } from "./planLimits";

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Returns the caller's effective plan, creator flag, and founding member flag.
 * Use this on the frontend instead of reading the raw subscription object when
 * you need to gate features — it correctly bypasses plan checks for creator/founding IDs.
 */
export const getSelfPlan = query({
  args: {},
  handler: async (ctx): Promise<{ plan: PlanId; isCreator: boolean; isFoundingUser: boolean } | null> => {
    const identity = await ctx.auth.getUserIdentity();
    // Return null (not a fake "free" plan) when auth hasn't propagated yet.
    // The frontend treats null the same as undefined — don't render plan-gated UI.
    if (!identity) return null;

    // Creator bypass
    if (CREATOR_CLERK_IDS.has(identity.subject)) {
      return { plan: "team", isCreator: true, isFoundingUser: false };
    }

    // Founding member bypass (hardcoded IDs)
    if (FOUNDING_CLERK_IDS.has(identity.subject)) {
      return { plan: "team", isCreator: false, isFoundingUser: true };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return { plan: "free", isCreator: false, isFoundingUser: false };

    // Founding member via DB flag (auto-granted for first 10 signups)
    if (user.isFoundingUser === true) {
      return { plan: "team", isCreator: false, isFoundingUser: true };
    }

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!sub) return { plan: "free", isCreator: false, isFoundingUser: false };

    if (sub.status === "active" || sub.status === "trialing") {
      return { plan: (sub.plan as PlanId) ?? "free", isCreator: false, isFoundingUser: false };
    }
    return { plan: "free", isCreator: false, isFoundingUser: false };
  },
});

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
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const getByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// ── Internal mutations (called only from Stripe webhook handler) ──────────

export const upsertFromStripe = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    plan: v.string(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        status: args.status,
        plan: args.plan,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      status: args.status,
      plan: args.plan,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
    });
  },
});

export const updateFromStripe = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    plan: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .unique();

    if (!existing) return null;

    const { stripeSubscriptionId, ...fields } = args;
    await ctx.db.patch(existing._id, fields);
    return existing._id;
  },
});

export const deleteByStripeSubscriptionId = internalMutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// ── Internal query for looking up user by Stripe customer ID ──────────────

export const getUserByStripeCustomerId = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .first();
    return sub ? sub.userId : null;
  },
});
