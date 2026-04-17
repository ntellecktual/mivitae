import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .take(50);
  },
});

export const getSelfCertificates = query({
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
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("asc")
      .take(50);
  },
});

export const createSelf = mutation({
  args: {
    name: v.string(),
    issuer: v.string(),
    issueDate: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    credentialId: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
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
    if (!portfolio) throw new Error("Portfolio not found. Complete profile setup first.");

    if (args.name.length > 200) throw new Error("Certificate name too long (max 200)");
    if (args.issuer.length > 200) throw new Error("Issuer too long (max 200)");
    if (args.credentialUrl && args.credentialUrl.length > 500) throw new Error("URL too long (max 500)");

    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(51);
    if (existing.length >= 50) throw new Error("Maximum of 50 certificates reached");

    return await ctx.db.insert("certificates", {
      ...args,
      userId: user._id,
      portfolioId: portfolio._id,
    });
  },
});

export const updateSelf = mutation({
  args: {
    certId: v.id("certificates"),
    name: v.optional(v.string()),
    issuer: v.optional(v.string()),
    issueDate: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    credentialId: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
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

    const cert = await ctx.db.get(args.certId);
    if (!cert || cert.userId !== user._id) throw new Error("Not authorized");

    if (args.name !== undefined && args.name.length > 200) throw new Error("Certificate name too long (max 200)");
    if (args.issuer !== undefined && args.issuer.length > 200) throw new Error("Issuer too long (max 200)");
    if (args.credentialUrl && args.credentialUrl.length > 500) throw new Error("URL too long (max 500)");

    const { certId, ...fields } = args;
    await ctx.db.patch(certId, fields);
  },
});

export const removeSelf = mutation({
  args: { certId: v.id("certificates") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const cert = await ctx.db.get(args.certId);
    if (!cert || cert.userId !== user._id) throw new Error("Not authorized");

    await ctx.db.delete(args.certId);
  },
});
