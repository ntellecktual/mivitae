import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";

export const getState = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const initialize = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("onboardingState", {
      userId: args.userId,
      currentStep: 0,
      completedSteps: [],
      isComplete: false,
    });
  },
});

export const updateStep = internalMutation({
  args: {
    userId: v.id("users"),
    currentStep: v.number(),
  },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!state) throw new Error("Onboarding state not found");
    await ctx.db.patch(state._id, { currentStep: args.currentStep });
  },
});

export const markStepComplete = internalMutation({
  args: {
    userId: v.id("users"),
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!state) throw new Error("Onboarding state not found");

    const completedSteps = state.completedSteps.includes(args.step)
      ? state.completedSteps
      : [...state.completedSteps, args.step];

    await ctx.db.patch(state._id, { completedSteps });
  },
});

export const complete = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!state) throw new Error("Onboarding state not found");
    await ctx.db.patch(state._id, { isComplete: true });
  },
});

// ── Auth-aware versions (used by the onboarding wizard UI) ───────────────

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
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const initializeSelf = mutation({
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
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("onboardingState", {
      userId: user._id,
      currentStep: 0,
      completedSteps: [],
      isComplete: false,
    });
  },
});

export const advanceSelf = mutation({
  args: { completedStep: v.number(), nextStep: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const state = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!state) throw new Error("Onboarding state not found");

    const completedSteps = state.completedSteps.includes(args.completedStep)
      ? state.completedSteps
      : [...state.completedSteps, args.completedStep];

    await ctx.db.patch(state._id, {
      currentStep: args.nextStep,
      completedSteps,
    });
  },
});

export const completeSelf = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const state = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!state) throw new Error("Onboarding state not found");

    await ctx.db.patch(state._id, {
      isComplete: true,
      currentStep: 5,
      completedSteps: [0, 1, 2, 3, 4, 5],
    });
  },
});
