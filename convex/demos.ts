import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getUserPlan, getLimits } from "./planLimits";

// ── Template queries ─────────────────────────────────────────────────────

export const listTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("demoTemplates")
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(100);
  },
});

export const listTemplatesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("demoTemplates")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .take(100);
  },
});

export const getTemplate = query({
  args: { templateId: v.id("demoTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

// ── Template seeding (internal) ──────────────────────────────────────────

export const seedTemplate = internalMutation({
  args: {
    name: v.string(),
    category: v.string(),
    description: v.string(),
    defaultContent: v.string(),
    htmlContent: v.optional(v.string()),
    previewImageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("demoTemplates", {
      ...args,
    });
  },
});

// ── User demo queries ────────────────────────────────────────────────────

export const getSelfDemos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const demos = await ctx.db
      .query("userDemos")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);

    // Resolve banner URLs from storage
    const resolved = await Promise.all(
      demos.map(async (d) => {
        let resolvedBannerUrl = d.bannerUrl;
        if (d.bannerStorageId) {
          resolvedBannerUrl =
            (await ctx.storage.getUrl(d.bannerStorageId)) ?? undefined;
        }
        return { ...d, bannerUrl: resolvedBannerUrl };
      })
    );
    return resolved;
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const demos = await ctx.db
      .query("userDemos")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    const resolved = await Promise.all(
      demos.map(async (d) => {
        let resolvedBannerUrl = d.bannerUrl;
        if (d.bannerStorageId) {
          resolvedBannerUrl =
            (await ctx.storage.getUrl(d.bannerStorageId)) ?? undefined;
        }
        return { ...d, bannerUrl: resolvedBannerUrl };
      })
    );
    return resolved;
  },
});

export const getDemo = query({
  args: { demoId: v.id("userDemos") },
  handler: async (ctx, args) => {
    const demo = await ctx.db.get(args.demoId);
    if (!demo) return null;

    // If demo is public, anyone can view it
    if (!demo.isPublic) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
      if (!user || user._id !== demo.userId) return null;
    }

    let resolvedBannerUrl = demo.bannerUrl;
    if (demo.bannerStorageId) {
      resolvedBannerUrl =
        (await ctx.storage.getUrl(demo.bannerStorageId)) ?? undefined;
    }
    return { ...demo, bannerUrl: resolvedBannerUrl };
  },
});

// ── File upload URL for demo banners ─────────────────────────────────────

export const generateBannerUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// ── User demo mutations (auth-aware) ─────────────────────────────────────

export const createSelf = mutation({
  args: {
    templateId: v.optional(v.id("demoTemplates")),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    htmlContent: v.optional(v.string()),
    bannerStorageId: v.optional(v.id("_storage")),
    bannerUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    demoUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Input validation
    if (args.title.length > 200) throw new Error("Title too long (max 200)");
    if (args.description.length > 1000)
      throw new Error("Description too long (max 1000)");
    if (args.content.length > 100000)
      throw new Error("Content too long (max 100KB)");
    if (args.htmlContent && args.htmlContent.length > 500000)
      throw new Error("HTML content too long (max 500KB)");

    // Plan limit enforcement
    const plan = await getUserPlan(ctx, user._id);
    const limits = getLimits(plan);
    const existingDemos = await ctx.db
      .query("userDemos")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(limits.maxDemos + 1);
    if (existingDemos.length >= limits.maxDemos) {
      throw new Error(
        `You've reached the ${plan} plan limit of ${limits.maxDemos} demos. Upgrade for more.`
      );
    }

    // Determine order
    const order = existingDemos.length;

    return await ctx.db.insert("userDemos", {
      userId: user._id,
      templateId: args.templateId,
      title: args.title,
      description: args.description,
      content: args.content,
      htmlContent: args.htmlContent,
      bannerStorageId: args.bannerStorageId,
      bannerUrl: args.bannerUrl,
      status: args.status ?? "live",
      tags: args.tags ?? [],
      demoUrl: args.demoUrl,
      githubUrl: args.githubUrl,
      order,
      isPublic: true,
      createdAt: Date.now(),
    });
  },
});

export const updateSelf = mutation({
  args: {
    demoId: v.id("userDemos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    htmlContent: v.optional(v.string()),
    bannerStorageId: v.optional(v.id("_storage")),
    bannerUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    demoUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const demo = await ctx.db.get(args.demoId);
    if (!demo || demo.userId !== user._id) {
      throw new Error("Demo not found or not owned by you");
    }

    // Input validation on updated fields
    if (args.title !== undefined && args.title.length > 200)
      throw new Error("Title too long (max 200)");
    if (args.description !== undefined && args.description.length > 1000)
      throw new Error("Description too long (max 1000)");
    if (args.content !== undefined && args.content.length > 100000)
      throw new Error("Content too long (max 100KB)");
    if (args.htmlContent !== undefined && args.htmlContent.length > 500000)
      throw new Error("HTML content too long (max 500KB)");

    const { demoId, ...fields } = args;
    await ctx.db.patch(demoId, fields);
  },
});

export const removeSelf = mutation({
  args: { demoId: v.id("userDemos") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const demo = await ctx.db.get(args.demoId);
    if (!demo || demo.userId !== user._id) {
      throw new Error("Demo not found or not owned by you");
    }

    // Clean up banner from storage
    if (demo.bannerStorageId) {
      await ctx.storage.delete(demo.bannerStorageId);
    }

    // Also remove this demo from any portfolio sections that reference it
    const sections = await ctx.db
      .query("portfolioSections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(200);

    for (const section of sections) {
      if (section.demoIds.includes(args.demoId)) {
        await ctx.db.patch(section._id, {
          demoIds: section.demoIds.filter((id) => id !== args.demoId),
        });
      }
    }

    await ctx.db.delete(args.demoId);
  },
});
