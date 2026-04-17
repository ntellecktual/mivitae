import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// ── Internal query: look up a cache entry ─────────────────────────────────
export const getCacheEntry = internalQuery({
  args: { cacheKey: v.string() },
  handler: async (ctx, { cacheKey }) => {
    return await ctx.db
      .query("demoCache")
      .withIndex("by_cacheKey", (q) => q.eq("cacheKey", cacheKey))
      .first();
  },
});

// ── Internal mutation: store a new cache entry ────────────────────────────
export const storeCacheEntry = internalMutation({
  args: {
    cacheKey: v.string(),
    html: v.string(),
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("demoCache", {
      cacheKey: args.cacheKey,
      html: args.html,
      title: args.title,
      description: args.description,
      tags: args.tags,
      hitCount: 0,
      createdAt: Date.now(),
    });
  },
});

// ── Internal mutation: increment hit count ────────────────────────────────
export const incrementCacheHit = internalMutation({
  args: { id: v.id("demoCache") },
  handler: async (ctx, { id }) => {
    const entry = await ctx.db.get(id);
    if (entry) {
      await ctx.db.patch(id, { hitCount: (entry.hitCount ?? 0) + 1 });
    }
  },
});
