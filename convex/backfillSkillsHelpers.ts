import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

export const getAllPortfolios = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("portfolios").take(1000);
  },
});

export const getSkillCount = internalQuery({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_portfolioId", (q) => q.eq("portfolioId", args.portfolioId))
      .take(1);
    return skills.length;
  },
});

export const getPortfolioSections = internalQuery({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolioSections")
      .withIndex("by_portfolioId", (q) => q.eq("portfolioId", args.portfolioId))
      .take(100);
  },
});
