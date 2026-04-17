import { query } from "./_generated/server";
import { CREATOR_CLERK_IDS } from "./planLimits";

/** Verify the caller is a creator/superadmin. Returns the user or throws. */
async function requireAdmin(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  if (!CREATOR_CLERK_IDS.has(identity.subject)) throw new Error("Forbidden");
  return identity;
}

export const getSystemStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").take(10000);
    const profiles = await ctx.db.query("profiles").take(10000);
    const publicProfiles = profiles.filter(p => p.isPublic);
    const subscriptions = await ctx.db.query("subscriptions").take(10000);
    const demos = await ctx.db.query("userDemos").take(10000);
    const teams = await ctx.db.query("teams").take(10000);

    // Subscriptions by status
    const subsByStatus: Record<string, number> = {};
    const subsByPlan: Record<string, number> = {};
    for (const sub of subscriptions) {
      subsByStatus[sub.status] = (subsByStatus[sub.status] ?? 0) + 1;
      subsByPlan[sub.plan] = (subsByPlan[sub.plan] ?? 0) + 1;
    }

    // Users created in last 7 / 30 days
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const newUsersLast7 = users.filter(u => u.createdAt > sevenDaysAgo).length;
    const newUsersLast30 = users.filter(u => u.createdAt > thirtyDaysAgo).length;

    return {
      totalUsers: users.length,
      totalProfiles: profiles.length,
      publicProfiles: publicProfiles.length,
      totalDemos: demos.length,
      totalTeams: teams.length,
      totalSubscriptions: subscriptions.length,
      subsByStatus,
      subsByPlan,
      newUsersLast7,
      newUsersLast30,
    };
  },
});

export const getRecentUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").order("desc").take(50);

    const usersWithProfile = await Promise.all(
      users.map(async (user) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique();
        const sub = await ctx.db
          .query("subscriptions")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique();
        return {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          slug: profile?.slug,
          isPublic: profile?.isPublic ?? false,
          plan: sub?.plan ?? "free",
          subStatus: sub?.status,
        };
      })
    );

    return usersWithProfile;
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    return CREATOR_CLERK_IDS.has(identity.subject);
  },
});
