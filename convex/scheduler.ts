import { v } from "convex/values";
import { internalAction, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// ── Internal queries ──────────────────────────────────────────────────────

/** Get trial subscriptions expiring between two timestamps. */
export const getExpiringTrials = internalQuery({
  args: { minDate: v.number(), maxDate: v.number() },
  handler: async (ctx, args) => {
    // Grab subscriptions with status "trialing" — bounded scan
    const all = await ctx.db.query("subscriptions").take(5000);
    return all.filter(
      (s) =>
        s.status === "trialing" &&
        s.currentPeriodEnd >= args.minDate &&
        s.currentPeriodEnd <= args.maxDate
    );
  },
});

/** Get a user by their internal Convex ID. */
export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// ── Scheduled actions ─────────────────────────────────────────────────────

/** Send trial-expiring reminder emails to users whose trial ends within 7 days. */
export const sendTrialExpiringEmails = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Find trials expiring between 1 day and 7 days from now
    const expiringTrials = await ctx.runQuery(
      internal.scheduler.getExpiringTrials,
      {
        minDate: now + oneDayMs,
        maxDate: now + 7 * oneDayMs,
      }
    );

    for (const sub of expiringTrials) {
      const user = await ctx.runQuery(internal.scheduler.getUserById, {
        userId: sub.userId,
      });
      if (!user?.email) continue;

      const daysLeft = Math.ceil(
        (sub.currentPeriodEnd - now) / oneDayMs
      );

      try {
        await ctx.runAction(internal.emails.sendTrialExpiring, {
          email: user.email,
          firstName: user.firstName,
          daysLeft,
        });
      } catch (e) {
        console.error(
          `Failed to send trial expiring email to ${user.email}:`,
          e
        );
      }
    }
  },
});

// ── Stale data cleanup ────────────────────────────────────────────────────

/** Delete profileViews older than 90 days (batch of 500). */
export const cleanupOldProfileViews = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    // Use index-based range query — profileViews are indexed by (profileId, viewedAt)
    // but we need all old views across all profiles, so we scan by _creationTime
    const oldViews = await ctx.db
      .query("profileViews")
      .order("asc")
      .take(500);

    let deleted = 0;
    for (const view of oldViews) {
      if (view.viewedAt < cutoff) {
        await ctx.db.delete(view._id);
        deleted++;
      } else {
        // Ordered asc, so once we hit a recent one, all remaining are newer
        break;
      }
    }

    // If we deleted a full batch, schedule another pass
    if (deleted === 500) {
      await ctx.scheduler.runAfter(0, internal.scheduler.cleanupOldProfileViews, {});
    }
  },
});

// ── Drip campaign ─────────────────────────────────────────────────────────

const DRIP_SCHEDULE: { emailKey: string; delayDays: number }[] = [
  { emailKey: "day1_setup", delayDays: 1 },
  { emailKey: "day3_profile", delayDays: 3 },
  { emailKey: "day7_demo", delayDays: 7 },
  { emailKey: "day14_publish", delayDays: 14 },
];

/** Get all drip emails already sent to a user. */
export const getDripsSentForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailDrip")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/** Record that a drip email was sent. */
export const recordDripSent = internalMutation({
  args: { userId: v.id("users"), emailKey: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailDrip", {
      userId: args.userId,
      emailKey: args.emailKey,
      sentAt: Date.now(),
    });
  },
});

/** Process drip campaign — runs daily, sends scheduled emails to users. */
export const processDripCampaign = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Only consider users created in the last 30 days
    const allUsers = await ctx.runQuery(internal.scheduler.getRecentUsers, {
      cutoff: now - 30 * oneDayMs,
    });

    for (const user of allUsers) {
      if (!user.email) continue;

      const sentDrips = await ctx.runQuery(
        internal.scheduler.getDripsSentForUser,
        { userId: user._id }
      );
      const sentKeys = new Set(sentDrips.map((d: { emailKey: string }) => d.emailKey));
      const userAgeDays = (now - user.createdAt) / oneDayMs;

      for (const { emailKey, delayDays } of DRIP_SCHEDULE) {
        if (sentKeys.has(emailKey)) continue;
        if (userAgeDays < delayDays) continue;

        try {
          await ctx.runAction(internal.emails.sendDripEmail, {
            email: user.email,
            firstName: user.firstName ?? "there",
            emailKey,
          });
          await ctx.runMutation(internal.scheduler.recordDripSent, {
            userId: user._id,
            emailKey,
          });
        } catch (e) {
          console.error(`Failed drip ${emailKey} to ${user.email}:`, e);
        }
      }
    }
  },
});

/** Get users created after a cutoff timestamp. */
export const getRecentUsers = internalQuery({
  args: { cutoff: v.number() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").order("desc").take(5000);
    return users.filter((u) => u.createdAt >= args.cutoff);
  },
});

// ── Stale data cleanup ────────────────────────────────────────────────────

/** Delete processed webhook events older than 30 days (batch of 500). */
export const cleanupOldWebhookEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const oldEvents = await ctx.db
      .query("webhookEvents")
      .order("asc")
      .take(500);

    let deleted = 0;
    for (const event of oldEvents) {
      if (event.processedAt < cutoff) {
        await ctx.db.delete(event._id);
        deleted++;
      } else {
        break;
      }
    }

    if (deleted === 500) {
      await ctx.scheduler.runAfter(0, internal.scheduler.cleanupOldWebhookEvents, {});
    }
  },
});
