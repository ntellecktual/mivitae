import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getUserPlan, getLimits } from "./planLimits";
import { ensureAuthUser } from "./authHelpers";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolioSections")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);
  },
});

export const getByPortfolioId = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolioSections")
      .withIndex("by_portfolioId", (q) =>
        q.eq("portfolioId", args.portfolioId)
      )
      .take(100);
  },
});

// NOTE: Use createSelf (auth-aware) from the client, or createInternal from server.
// No public create mutation — this prevents unauthorized inserts.

// NOTE: Use updateSelf (auth-aware) from the client.

// NOTE: Use removeSelf (auth-aware) from the client.

// ── Auth-aware versions ───────────────────────────────────────────────────

export const getSelfSections = query({
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
      .query("portfolioSections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);
  },
});

export const createSelf = mutation({
  args: {
    companyName: v.string(),
    role: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    description: v.string(),
    skills: v.array(v.string()),
    achievements: v.array(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!portfolio) throw new Error("Portfolio not found. Complete the profile step first.");

    // Input validation
    if (args.companyName.length > 200) throw new Error("Company name too long (max 200)");
    if (args.role.length > 200) throw new Error("Role too long (max 200)");
    if (args.description.length > 5000) throw new Error("Description too long (max 5000)");
    if (args.skills.length > 30) throw new Error("Too many skills (max 30)");
    if (args.achievements.length > 20) throw new Error("Too many achievements (max 20)");
    for (const s of args.skills) if (s.length > 100) throw new Error("Skill name too long (max 100)");
    for (const a of args.achievements) if (a.length > 500) throw new Error("Achievement too long (max 500)");

    // Limit total sections per user (plan-aware)
    const plan = await getUserPlan(ctx, user._id);
    const limits = getLimits(plan);
    const existingSections = await ctx.db
      .query("portfolioSections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(limits.maxPortfolioSections + 1);
    if (existingSections.length >= limits.maxPortfolioSections) {
      throw new Error(
        `You've reached the ${plan} plan limit of ${limits.maxPortfolioSections} work entries. Upgrade for more.`
      );
    }

    return await ctx.db.insert("portfolioSections", {
      ...args,
      portfolioId: portfolio._id,
      userId: user._id,
      demoIds: [],
    });
  },
});

// Delete all portfolio sections for a given portfolio (used before re-parse to avoid duplicates)
export const deleteAllForPortfolioInternal = internalMutation({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("portfolioSections")
      .withIndex("by_portfolioId", (q) => q.eq("portfolioId", args.portfolioId))
      .take(200);
    await Promise.all(existing.map((s) => ctx.db.delete(s._id)));
  },
});

// Internal version for resumeParser (accepts portfolioId + userId directly)
export const createInternal = internalMutation({
  args: {
    portfolioId: v.id("portfolios"),
    userId: v.id("users"),
    companyName: v.string(),
    role: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    description: v.string(),
    skills: v.array(v.string()),
    achievements: v.array(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("portfolioSections", {
      ...args,
      demoIds: [],
    });
  },
});

export const updateSelf = mutation({
  args: {
    sectionId: v.id("portfolioSections"),
    companyName: v.optional(v.string()),
    role: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    achievements: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const section = await ctx.db.get(args.sectionId);
    if (!section || section.userId !== user._id) throw new Error("Not authorized");

    // Input validation on updated fields
    if (args.companyName !== undefined && args.companyName.length > 200) throw new Error("Company name too long (max 200)");
    if (args.role !== undefined && args.role.length > 200) throw new Error("Role too long (max 200)");
    if (args.description !== undefined && args.description.length > 5000) throw new Error("Description too long (max 5000)");
    if (args.skills && args.skills.length > 30) throw new Error("Too many skills (max 30)");
    if (args.achievements && args.achievements.length > 20) throw new Error("Too many achievements (max 20)");
    if (args.skills) for (const s of args.skills) if (s.length > 100) throw new Error("Skill name too long (max 100)");
    if (args.achievements) for (const a of args.achievements) if (a.length > 500) throw new Error("Achievement too long (max 500)");

    const { sectionId, ...fields } = args;
    await ctx.db.patch(sectionId, fields);
  },
});

export const removeSelf = mutation({
  args: { sectionId: v.id("portfolioSections") },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const section = await ctx.db.get(args.sectionId);
    if (!section || section.userId !== user._id) throw new Error("Not authorized");

    await ctx.db.delete(args.sectionId);
  },
});

export const linkDemo = mutation({
  args: {
    sectionId: v.id("portfolioSections"),
    demoId: v.id("userDemos"),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const section = await ctx.db.get(args.sectionId);
    if (!section || section.userId !== user._id) throw new Error("Not authorized");

    if (!section.demoIds.includes(args.demoId)) {
      await ctx.db.patch(args.sectionId, {
        demoIds: [...section.demoIds, args.demoId],
      });
    }
  },
});

export const unlinkDemo = mutation({
  args: {
    sectionId: v.id("portfolioSections"),
    demoId: v.id("userDemos"),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const section = await ctx.db.get(args.sectionId);
    if (!section || section.userId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.sectionId, {
      demoIds: section.demoIds.filter((id) => id !== args.demoId),
    });
  },
});

// ── Image Upload ─────────────────────────────────────────────────────────

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await ensureAuthUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateImage = mutation({
  args: {
    sectionId: v.id("portfolioSections"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);
    const section = await ctx.db.get(args.sectionId);
    if (!section || section.userId !== user._id) throw new Error("Not authorized");

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Storage URL not found");

    // Delete old image if exists
    if (section.imageStorageId) {
      await ctx.storage.delete(section.imageStorageId);
    }

    await ctx.db.patch(args.sectionId, {
      imageStorageId: args.storageId,
      imageUrl: url,
    });
  },
});

export const removeImage = mutation({
  args: { sectionId: v.id("portfolioSections") },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);
    const section = await ctx.db.get(args.sectionId);
    if (!section || section.userId !== user._id) throw new Error("Not authorized");

    if (section.imageStorageId) {
      await ctx.storage.delete(section.imageStorageId);
    }
    await ctx.db.patch(args.sectionId, {
      imageStorageId: undefined,
      imageUrl: undefined,
    });
  },
});
