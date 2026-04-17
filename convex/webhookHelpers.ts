import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";

/**
 * Check if a webhook event has already been processed (idempotency guard).
 */
export const isEventProcessed = internalQuery({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();
    return !!existing;
  },
});

/**
 * Mark a webhook event as processed.
 */
export const markEventProcessed = internalMutation({
  args: {
    eventId: v.string(),
    source: v.union(v.literal("clerk"), v.literal("stripe")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookEvents", {
      eventId: args.eventId,
      source: args.source,
      processedAt: Date.now(),
    });
  },
});
