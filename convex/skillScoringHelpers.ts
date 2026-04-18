import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUser } from "./authHelpers";

// ── Internal helpers for the skill scoring action ──────────────────────

export const getDemo = internalQuery({
  args: { demoId: v.id("userDemos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.demoId);
  },
});

export const getUserPortfolioContext = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!portfolio) return null;

    const sections = await ctx.db
      .query("portfolioSections")
      .withIndex("by_portfolioId", (q) =>
        q.eq("portfolioId", portfolio._id),
      )
      .take(3);

    const skills = await ctx.db
      .query("skills")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(20);

    return {
      role: sections.map((s) => s.role).join(", ") || "professional",
      skills: skills.map((s) => s.name).join(", ") || "various",
    };
  },
});

export const storeScore = internalMutation({
  args: {
    demoId: v.id("userDemos"),
    userId: v.id("users"),
    overallScore: v.number(),
    dimensions: v.object({
      technicalDepth: v.number(),
      realWorldRelevance: v.number(),
      communicationClarity: v.number(),
      problemSolving: v.number(),
      innovation: v.number(),
    }),
    summary: v.string(),
    strengths: v.array(v.string()),
    improvements: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Upsert: delete old score for this demo if exists
    const existing = await ctx.db
      .query("skillScores")
      .withIndex("by_demoId", (q) => q.eq("demoId", args.demoId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }

    await ctx.db.insert("skillScores", {
      demoId: args.demoId,
      userId: args.userId,
      overallScore: args.overallScore,
      dimensions: args.dimensions,
      summary: args.summary,
      strengths: args.strengths,
      improvements: args.improvements,
      gradedAt: Date.now(),
    });
  },
});

// ── Public queries for skill scores ────────────────────────────────────

/** Get skill score for a specific demo */
export const getByDemoId = query({
  args: { demoId: v.id("userDemos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skillScores")
      .withIndex("by_demoId", (q) => q.eq("demoId", args.demoId))
      .unique();
  },
});

/** Get all skill scores for the authenticated user */
export const getSelfScores = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("skillScores")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/** Get all skill scores for any user (public profiles) */
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skillScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/** Get average verified score across all demos for a user */
export const getUserAverageScore = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("skillScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (scores.length === 0) return null;

    const avg = Math.round(
      scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length,
    );

    return {
      averageScore: avg,
      totalGraded: scores.length,
      dimensions: {
        technicalDepth: Math.round(
          scores.reduce((s, sc) => s + sc.dimensions.technicalDepth, 0) /
            scores.length,
        ),
        realWorldRelevance: Math.round(
          scores.reduce((s, sc) => s + sc.dimensions.realWorldRelevance, 0) /
            scores.length,
        ),
        communicationClarity: Math.round(
          scores.reduce((s, sc) => s + sc.dimensions.communicationClarity, 0) /
            scores.length,
        ),
        problemSolving: Math.round(
          scores.reduce((s, sc) => s + sc.dimensions.problemSolving, 0) /
            scores.length,
        ),
        innovation: Math.round(
          scores.reduce((s, sc) => s + sc.dimensions.innovation, 0) /
            scores.length,
        ),
      },
    };
  },
});
