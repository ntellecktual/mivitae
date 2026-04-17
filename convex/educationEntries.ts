import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getUserPlan, getLimits } from "./planLimits";
import { ensureAuthUser } from "./authHelpers";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("educationEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(50);
  },
});

// NOTE: Use createSelf (auth-aware) from the client, or createInternal from server.

// NOTE: Use updateSelf (auth-aware) from the client.

// NOTE: Use removeSelf (auth-aware) from the client.

// ── Auth-aware versions ───────────────────────────────────────────────────

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
      .query("educationEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(50);
  },
});

export const createSelf = mutation({
  args: {
    institution: v.string(),
    degree: v.string(),
    fieldOfStudy: v.optional(v.string()),
    startYear: v.number(),
    endYear: v.optional(v.number()),
    gpa: v.optional(v.string()),
    honors: v.optional(v.string()),
    activities: v.array(v.string()),
    skills: v.optional(v.array(v.string())),
    relevantCoursework: v.optional(v.string()),
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
    if (args.institution.length > 200) throw new Error("Institution name too long (max 200)");
    if (args.degree.length > 200) throw new Error("Degree too long (max 200)");
    if (args.honors && args.honors.length > 200) throw new Error("Honors too long (max 200)");
    if (args.activities.length > 20) throw new Error("Too many activities (max 20)");
    for (const a of args.activities) if (a.length > 200) throw new Error("Activity too long (max 200)");
    if (args.skills && args.skills.length > 30) throw new Error("Too many skills (max 30)");
    if (args.relevantCoursework && args.relevantCoursework.length > 1000) throw new Error("Relevant coursework too long (max 1000)");
    if (args.startYear < 1900 || args.startYear > 2100) throw new Error("Invalid start year");
    if (args.endYear !== undefined && (args.endYear < 1900 || args.endYear > 2100)) throw new Error("Invalid end year");

    // Limit total entries per user (plan-aware)
    const plan = await getUserPlan(ctx, user._id);
    const limits = getLimits(plan);
    const existingEntries = await ctx.db
      .query("educationEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(limits.maxEducationEntries + 1);
    if (existingEntries.length >= limits.maxEducationEntries) {
      throw new Error(
        `You've reached the ${plan} plan limit of ${limits.maxEducationEntries} education entries. Upgrade for more.`
      );
    }

    return await ctx.db.insert("educationEntries", {
      ...args,
      userId: user._id,
      portfolioId: portfolio._id,
    });
  },
});

// Internal version for resumeParser (accepts portfolioId + userId directly)
export const createInternal = internalMutation({
  args: {
    userId: v.id("users"),
    portfolioId: v.id("portfolios"),
    institution: v.string(),
    degree: v.string(),
    fieldOfStudy: v.optional(v.string()),
    startYear: v.number(),
    endYear: v.optional(v.number()),
    gpa: v.optional(v.string()),
    honors: v.optional(v.string()),
    activities: v.array(v.string()),
    skills: v.optional(v.array(v.string())),
    relevantCoursework: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("educationEntries", args);
  },
});

export const updateSelf = mutation({
  args: {
    entryId: v.id("educationEntries"),
    institution: v.optional(v.string()),
    degree: v.optional(v.string()),
    fieldOfStudy: v.optional(v.string()),
    startYear: v.optional(v.number()),
    endYear: v.optional(v.number()),
    gpa: v.optional(v.string()),
    honors: v.optional(v.string()),
    activities: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    relevantCoursework: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== user._id) throw new Error("Not authorized");

    // Input validation on updated fields
    if (args.institution !== undefined && args.institution.length > 200) throw new Error("Institution name too long (max 200)");
    if (args.degree !== undefined && args.degree.length > 200) throw new Error("Degree too long (max 200)");
    if (args.honors !== undefined && args.honors.length > 200) throw new Error("Honors too long (max 200)");
    if (args.activities && args.activities.length > 20) throw new Error("Too many activities (max 20)");
    if (args.activities) for (const a of args.activities) if (a.length > 200) throw new Error("Activity too long (max 200)");
    if (args.skills && args.skills.length > 30) throw new Error("Too many skills (max 30)");
    if (args.relevantCoursework && args.relevantCoursework.length > 1000) throw new Error("Relevant coursework too long (max 1000)");
    if (args.startYear !== undefined && (args.startYear < 1900 || args.startYear > 2100)) throw new Error("Invalid start year");
    if (args.endYear !== undefined && (args.endYear < 1900 || args.endYear > 2100)) throw new Error("Invalid end year");

    const { entryId, ...fields } = args;
    await ctx.db.patch(entryId, fields);
  },
});

export const removeSelf = mutation({
  args: { entryId: v.id("educationEntries") },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== user._id) throw new Error("Not authorized");

    await ctx.db.delete(args.entryId);
  },
});
