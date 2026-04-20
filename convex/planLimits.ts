import { MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ── Creator / Superadmin bypass ────────────────────────────────────────────
// These Clerk user IDs always receive full team-level access regardless of
// subscription status. Add additional IDs here to grant creator access.
export const CREATOR_CLERK_IDS = new Set([
  "user_3CQM2bLQWM1PMcueoShBM22ie1w",
]);

// ── Founding Users ───────────────────────────────────────────────────────────
// First 10 users get free pro+team access for life. Add Clerk IDs here for
// immediate effect, or they are auto-granted via isFoundingUser in the DB.
export const FOUNDING_CLERK_IDS = new Set([
  "user_3CV8skhzPWeAb9DyRLD1GJBDabZ",
]);

// ── Plan Limits ────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free: {
    maxPortfolioSections: 5,
    maxEducationEntries: 3,
    maxDemos: 3,
    maxResumeParsesPerDay: 2,
    analyticsAccess: false,
    customTheme: false,
    themePresets: true,        // free users can apply preset themes
    fullThemeStudio: false,    // colors, fonts, layout, sections, CSS
  },
  pro: {
    maxPortfolioSections: 50,
    maxEducationEntries: 20,
    maxDemos: 25,
    maxResumeParsesPerDay: 10,
    analyticsAccess: true,
    customTheme: true,
    themePresets: true,
    fullThemeStudio: true,
  },
  team: {
    maxPortfolioSections: 50,
    maxEducationEntries: 20,
    maxDemos: 50,
    maxResumeParsesPerDay: 20,
    analyticsAccess: true,
    customTheme: true,
    themePresets: true,
    fullThemeStudio: true,
  },
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

// ── Helper: resolve current plan for a user ────────────────────────────────

export async function getUserPlan(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<PlanId> {
  // Creator / founding user bypass: always return top-tier plan
  const userRecord = await ctx.db.get(userId);
  if (
    userRecord &&
    (CREATOR_CLERK_IDS.has(userRecord.clerkId) ||
      FOUNDING_CLERK_IDS.has(userRecord.clerkId) ||
      userRecord.isFoundingUser === true)
  ) {
    return "team";
  }

  const sub = await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (!sub) return "free";
  if (sub.status === "active" || sub.status === "trialing") {
    return (sub.plan as PlanId) ?? "free";
  }
  return "free";
}

export function getLimits(plan: PlanId) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
