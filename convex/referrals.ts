import { v } from "convex/values";
import {
  query,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Internal ────────────────────────────────────────────────────────────────

export const ensureCode = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    if (user.referralCode) return user.referralCode;

    // Generate a unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", code))
        .unique();
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    await ctx.db.patch(args.userId, { referralCode: code });
    return code;
  },
});

export const claimReferral = internalMutation({
  args: {
    referredUserId: v.id("users"),
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Don't double-count
    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_referredUserId", (q) =>
        q.eq("referredUserId", args.referredUserId)
      )
      .unique();
    if (existing) return;

    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referralCode", (q) =>
        q.eq("referralCode", args.referralCode)
      )
      .unique();

    if (!referrer || referrer._id === args.referredUserId) return;

    await ctx.db.insert("referrals", {
      referrerId: referrer._id,
      referredUserId: args.referredUserId,
      createdAt: Date.now(),
      status: "pending",
    });
  },
});

// Called when a referred user converts to a paid subscriber
export const creditReferral = internalMutation({
  args: { referredUserId: v.id("users") },
  handler: async (ctx, args) => {
    const referral = await ctx.db
      .query("referrals")
      .withIndex("by_referredUserId", (q) =>
        q.eq("referredUserId", args.referredUserId)
      )
      .unique();

    if (!referral || referral.status === "credited") return;

    // Mark credited
    await ctx.db.patch(referral._id, {
      status: "credited",
      creditedAt: Date.now(),
    });

    // Increment referrer's credit balance
    const referrer = await ctx.db.get(referral.referrerId);
    if (referrer) {
      await ctx.db.patch(referral.referrerId, {
        referralCredits: (referrer.referralCredits ?? 0) + 1,
      });
    }
  },
});

export const getByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referrals")
      .withIndex("by_referrerId", (q) => q.eq("referrerId", args.userId))
      .collect();
  },
});

// ── Public ─────────────────────────────────────────────────────────────────

export const getMyCode = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    return {
      code: user.referralCode ?? null,
      credits: user.referralCredits ?? 0,
    };
  },
});

export const getMyStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrerId", (q) => q.eq("referrerId", user._id))
      .collect();

    const pending = referrals.filter((r) => r.status === "pending").length;
    const credited = referrals.filter((r) => r.status === "credited").length;

    // Fetch referred user details
    const referred = await Promise.all(
      referrals.map(async (r) => {
        const u = await ctx.db.get(r.referredUserId);
        return {
          name: u
            ? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email
            : "Someone",
          joinedAt: r.createdAt,
          status: r.status,
        };
      })
    );

    return {
      code: user.referralCode ?? null,
      credits: user.referralCredits ?? 0,
      total: referrals.length,
      pending,
      credited,
      referred: referred.sort((a, b) => b.joinedAt - a.joinedAt),
    };
  },
});

// Ensure caller has a referral code (creates one if missing)
export const ensureMyCode: ReturnType<typeof mutation> = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    if (user.referralCode) return user.referralCode;

    const code: string | null = await ctx.runMutation(
      internal.referrals.ensureCode,
      { userId: user._id }
    );
    return code;
  },
});
