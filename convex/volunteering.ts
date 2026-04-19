import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByPortfolioId = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("volunteeringEntries")
      .withIndex("by_portfolioId", (q) =>
        q.eq("portfolioId", args.portfolioId)
      )
      .take(100);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("volunteeringEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);
  },
});

export const getSelfEntries = query({
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
      .query("volunteeringEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);
  },
});

export const createSelf = mutation({
  args: {
    organization: v.string(),
    role: v.string(),
    cause: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
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

    return await ctx.db.insert("volunteeringEntries", {
      userId: user._id,
      portfolioId: portfolio._id,
      organization: args.organization.trim().slice(0, 200),
      role: args.role.trim().slice(0, 200),
      cause: args.cause?.trim().slice(0, 100),
      startDate: args.startDate,
      endDate: args.endDate,
      description: args.description?.trim().slice(0, 2000),
      order: args.order,
    });
  },
});

export const updateSelf = mutation({
  args: {
    id: v.id("volunteeringEntries"),
    organization: v.optional(v.string()),
    role: v.optional(v.string()),
    cause: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
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

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== user._id) throw new Error("Not authorized");

    const updates: Record<string, unknown> = {};
    if (args.organization !== undefined) updates.organization = args.organization.trim().slice(0, 200);
    if (args.role !== undefined) updates.role = args.role.trim().slice(0, 200);
    if (args.cause !== undefined) updates.cause = args.cause.trim().slice(0, 100);
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.description !== undefined) updates.description = args.description.trim().slice(0, 2000);
    if (args.order !== undefined) updates.order = args.order;

    await ctx.db.patch(args.id, updates);
  },
});

export const removeSelf = mutation({
  args: { id: v.id("volunteeringEntries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== user._id) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
  },
});

// ── Image Upload ─────────────────────────────────────────────────────────

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateImage = mutation({
  args: {
    id: v.id("volunteeringEntries"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== user._id) throw new Error("Not authorized");

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Storage URL not found");

    if (entry.imageStorageId) {
      await ctx.storage.delete(entry.imageStorageId);
    }

    await ctx.db.patch(args.id, {
      imageStorageId: args.storageId,
      imageUrl: url,
    });
  },
});

export const removeImage = mutation({
  args: { id: v.id("volunteeringEntries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== user._id) throw new Error("Not authorized");

    if (entry.imageStorageId) {
      await ctx.storage.delete(entry.imageStorageId);
    }
    await ctx.db.patch(args.id, {
      imageStorageId: undefined,
      imageUrl: undefined,
    });
  },
});
