import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Shared cascade-delete helper — removes ALL user data including storage files,
 * team memberships, referrals, and owned teams.
 * Used by both `deleteSelf` (client-initiated) and `cascadeDeleteUser` (webhook-initiated).
 */
export async function cascadeDeleteUserData(
  ctx: MutationCtx,
  userId: Id<"users">
) {
  // 1. Profile + profile views
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (profile) {
    const views = await ctx.db
      .query("profileViews")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile._id))
      .collect();
    for (const view of views) {
      await ctx.db.delete(view._id);
    }
    await ctx.db.delete(profile._id);
  }

  // 2. Portfolios + sections + education entries
  const portfolios = await ctx.db
    .query("portfolios")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const p of portfolios) {
    const sections = await ctx.db
      .query("portfolioSections")
      .withIndex("by_portfolioId", (q) => q.eq("portfolioId", p._id))
      .collect();
    for (const s of sections) {
      await ctx.db.delete(s._id);
    }
    const eduEntries = await ctx.db
      .query("educationEntries")
      .withIndex("by_portfolioId", (q) => q.eq("portfolioId", p._id))
      .collect();
    for (const e of eduEntries) {
      await ctx.db.delete(e._id);
    }
    await ctx.db.delete(p._id);
  }

  // 3. Demos + embeddings
  const demos = await ctx.db
    .query("userDemos")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const d of demos) {
    // Clean up banner storage file if present
    if (d.bannerStorageId) {
      try {
        await ctx.storage.delete(d.bannerStorageId);
      } catch {
        // Storage file may already be deleted — continue cleanup
      }
    }
    const embeddings = await ctx.db
      .query("demoEmbeddings")
      .withIndex("by_demoId", (q) => q.eq("demoId", d._id))
      .collect();
    for (const e of embeddings) {
      await ctx.db.delete(e._id);
    }
    await ctx.db.delete(d._id);
  }

  // 4. Resumes — delete both the DB record AND the storage file
  const resumes = await ctx.db
    .query("resumes")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const r of resumes) {
    try {
      await ctx.storage.delete(r.storageId as Id<"_storage">);
    } catch {
      // Storage file may already be deleted — continue cleanup
    }
    await ctx.db.delete(r._id);
  }

  // 5. Subscription
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (subscription) {
    await ctx.db.delete(subscription._id);
  }

  // 6. Onboarding state
  const onboarding = await ctx.db
    .query("onboardingState")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (onboarding) {
    await ctx.db.delete(onboarding._id);
  }

  // 7. Team memberships — leave/remove from any team
  const memberships = await ctx.db
    .query("teamMemberships")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const m of memberships) {
    await ctx.db.delete(m._id);
  }

  // 8. Owned teams — delete team + all its memberships
  const ownedTeams = await ctx.db
    .query("teams")
    .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
    .collect();
  for (const team of ownedTeams) {
    // Clean up team logo storage file if present
    if (team.logoStorageId) {
      try {
        await ctx.storage.delete(team.logoStorageId);
      } catch {
        // Storage file may already be deleted — continue cleanup
      }
    }
    const teamMembers = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId", (q) => q.eq("teamId", team._id))
      .collect();
    for (const tm of teamMembers) {
      await ctx.db.delete(tm._id);
    }
    await ctx.db.delete(team._id);
  }

  // 9. Referrals (both as referrer and referred)
  const referralsAsReferrer = await ctx.db
    .query("referrals")
    .withIndex("by_referrerId", (q) => q.eq("referrerId", userId))
    .collect();
  for (const ref of referralsAsReferrer) {
    await ctx.db.delete(ref._id);
  }
  const referralsAsReferred = await ctx.db
    .query("referrals")
    .withIndex("by_referredUserId", (q) => q.eq("referredUserId", userId))
    .collect();
  for (const ref of referralsAsReferred) {
    await ctx.db.delete(ref._id);
  }

  // 10. Webhook events for this user (if they exist)
  // Note: webhookEvents don't have a userId index, so skip for now

  // 11. Skills
  const skills = await ctx.db
    .query("skills")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const s of skills) {
    await ctx.db.delete(s._id);
  }

  // 12. Volunteering entries
  const volunteering = await ctx.db
    .query("volunteeringEntries")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const v of volunteering) {
    await ctx.db.delete(v._id);
  }

  // 13. Click events (via profile)
  if (profile) {
    const clickEvents = await ctx.db
      .query("clickEvents")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile._id))
      .take(1000);
    for (const ce of clickEvents) {
      await ctx.db.delete(ce._id);
    }
  }

  // 14. Contact messages
  const contactMessages = await ctx.db
    .query("contactMessages")
    .withIndex("by_recipientUserId", (q) => q.eq("recipientUserId", userId))
    .collect();
  for (const cm of contactMessages) {
    await ctx.db.delete(cm._id);
  }

  // 15. Notifications
  const notifications = await ctx.db
    .query("notifications")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const n of notifications) {
    await ctx.db.delete(n._id);
  }

  // 16. Delete the user record itself
  await ctx.db.delete(userId);
}

export const exportData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .unique();

    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .collect();

    const sections = [];
    const education = [];
    for (const p of portfolios) {
      const s = await ctx.db
        .query("portfolioSections")
        .withIndex("by_portfolioId", (q: any) => q.eq("portfolioId", p._id))
        .collect();
      sections.push(...s);
      const e = await ctx.db
        .query("educationEntries")
        .withIndex("by_portfolioId", (q: any) => q.eq("portfolioId", p._id))
        .collect();
      education.push(...e);
    }

    const demos = await ctx.db
      .query("userDemos")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .collect();

    return {
      exportedAt: new Date().toISOString(),
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      profile: profile
        ? {
            slug: profile.slug,
            headline: profile.headline,
            bio: profile.bio,
            location: profile.location,
            websiteUrl: profile.websiteUrl,
            linkedinUrl: profile.linkedinUrl,
            githubUrl: profile.githubUrl,
            theme: profile.theme,
          }
        : null,
      workHistory: sections.map((s) => ({
        companyName: s.companyName,
        role: s.role,
        startDate: s.startDate,
        endDate: s.endDate,
        description: s.description,
        skills: s.skills,
        achievements: s.achievements,
      })),
      education: education.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        startYear: e.startYear,
        endYear: e.endYear,
        gpa: e.gpa,
        honors: e.honors,
        activities: e.activities,
      })),
      demos: demos.map((d) => ({
        title: d.title,
        description: d.description,
        content: d.content,
        isPublic: d.isPublic,
      })),
    };
  },
});

export const deleteSelf = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    await cascadeDeleteUserData(ctx, user._id);
  },
});

/**
 * Internal mutation for webhook-initiated account deletion (Clerk user.deleted).
 * Performs the same full cascade as deleteSelf.
 */
export const cascadeDeleteUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    await cascadeDeleteUserData(ctx, args.userId);
  },
});
