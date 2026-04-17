import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByPortfolioId = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_portfolioId", (q) =>
        q.eq("portfolioId", args.portfolioId)
      )
      .take(200);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(200);
  },
});

export const getSelfSkills = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("skills")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(200);
  },
});

export const createSelf = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    proficiency: v.optional(v.number()),
    yearsOfExperience: v.optional(v.number()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!portfolio) throw new Error("Portfolio not found");

    // Validate proficiency range
    if (args.proficiency !== undefined && (args.proficiency < 1 || args.proficiency > 5)) {
      throw new Error("Proficiency must be between 1 and 5");
    }

    return await ctx.db.insert("skills", {
      userId: user._id,
      portfolioId: portfolio._id,
      name: args.name.trim().slice(0, 100),
      category: args.category.trim().slice(0, 50),
      proficiency: args.proficiency,
      yearsOfExperience: args.yearsOfExperience,
      order: args.order,
    });
  },
});

export const updateSelf = mutation({
  args: {
    id: v.id("skills"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    proficiency: v.optional(v.number()),
    yearsOfExperience: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const skill = await ctx.db.get(args.id);
    if (!skill || skill.userId !== user._id) throw new Error("Not authorized");

    if (args.proficiency !== undefined && (args.proficiency < 1 || args.proficiency > 5)) {
      throw new Error("Proficiency must be between 1 and 5");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name.trim().slice(0, 100);
    if (args.category !== undefined) updates.category = args.category.trim().slice(0, 50);
    if (args.proficiency !== undefined) updates.proficiency = args.proficiency;
    if (args.yearsOfExperience !== undefined) updates.yearsOfExperience = args.yearsOfExperience;
    if (args.order !== undefined) updates.order = args.order;

    await ctx.db.patch(args.id, updates);
  },
});

export const removeSelf = mutation({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const skill = await ctx.db.get(args.id);
    if (!skill || skill.userId !== user._id) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
  },
});
