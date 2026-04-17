import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { CREATOR_CLERK_IDS } from "./planLimits";

// ── Helpers ────────────────────────────────────────────────────────────────

async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");

  return user;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Queries ────────────────────────────────────────────────────────────────

export const getMyTeam = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    // Find active membership
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (!membership) return null;

    const team = await ctx.db.get(membership.teamId);
    if (!team) return null;

    // Resolve logo URL from storage if a storageId is set
    let resolvedLogoUrl = team.logoUrl ?? null;
    if (team.logoStorageId) {
      resolvedLogoUrl = await ctx.storage.getUrl(team.logoStorageId);
    }

    return { ...team, logoUrl: resolvedLogoUrl, role: membership.role };
  },
});

export const getTeamBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getTeamMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    // Auth gate: only team members can list members
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    const myMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .unique();
    if (!myMembership) return [];

    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => {
        if (m.userId) {
          const user = await ctx.db.get(m.userId);
          const profile = user
            ? await ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .unique()
            : null;
          return {
            membershipId: m._id,
            userId: m.userId,
            role: m.role,
            status: m.status,
            inviteEmail: m.inviteEmail,
            joinedAt: m.joinedAt,
            name: user
              ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                user.email
              : m.inviteEmail ?? "Unknown",
            email: user?.email ?? m.inviteEmail,
            avatarUrl: user?.imageUrl,
            slug: profile?.slug,
            headline: profile?.headline,
          };
        }
        return {
          membershipId: m._id,
          userId: null,
          role: m.role,
          status: m.status,
          inviteEmail: m.inviteEmail,
          joinedAt: m.joinedAt,
          name: m.inviteEmail ?? "Invited",
          email: m.inviteEmail,
          avatarUrl: null,
          slug: null,
          headline: null,
        };
      })
    );

    return members.sort((a, b) => {
      const roleOrder = { owner: 0, admin: 1, member: 2 };
      return (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3);
    });
  },
});

export const getPublicTeamPage = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!team) return null;

    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId", (q) => q.eq("teamId", team._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => {
        if (!m.userId) return null;
        const user = await ctx.db.get(m.userId);
        if (!user) return null;
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique();
        if (!profile?.isPublic) return null;
        return {
          name:
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.email,
          slug: profile.slug,
          headline: profile.headline,
          avatarUrl: user.imageUrl ?? profile.avatarUrl,
          role: m.role,
        };
      })
    );

    // Resolve logo from Convex storage if needed
    let resolvedLogoUrl = team.logoUrl ?? null;
    if (team.logoStorageId) {
      resolvedLogoUrl = await ctx.storage.getUrl(team.logoStorageId);
    }

    return {
      team: { ...team, logoUrl: resolvedLogoUrl },
      members: members.filter(Boolean),
    };
  },
});

export const listPublicSlugs = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").take(10000);
    return teams.map((t) => ({
      slug: t.slug,
      updatedAt: t._creationTime,
    }));
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────

export const createTeam = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Input validation
    if (args.name.length > 100) throw new Error("Team name too long (max 100)");
    if (args.slug.length > 50) throw new Error("Slug too long (max 50)");
    if (args.slug.length < 3) throw new Error("Slug must be at least 3 characters");
    if (args.description && args.description.length > 500) throw new Error("Description too long (max 500)");
    if (args.website && args.website.length > 200) throw new Error("Website URL too long (max 200)");
    if (args.website) {
      const lower = args.website.trim().toLowerCase();
      if (lower.startsWith("javascript:") || lower.startsWith("data:")) throw new Error("Invalid website URL");
    }

    // Validate unique slug
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("Team slug is already taken");

    // Check user doesn't already own/belong to a team
    const existingMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (existingMembership) throw new Error("You already belong to a team");

    // Plan enforcement: only team plan can create a team (creators bypass)
    const identity = await ctx.auth.getUserIdentity();
    const isCreator = identity ? CREATOR_CLERK_IDS.has(identity.subject) : false;
    if (!isCreator) {
      const sub = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
        .unique();
      if (
        !sub ||
        sub.plan !== "team" ||
        (sub.status !== "active" && sub.status !== "trialing")
      ) {
        throw new Error("Team plan required to create a team. Upgrade first.");
      }
    }

    const teamId = await ctx.db.insert("teams", {
      ownerId: user._id,
      name: args.name,
      slug: args.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      description: args.description,
      website: args.website,
      createdAt: Date.now(),
    });

    await ctx.db.insert("teamMemberships", {
      teamId,
      userId: user._id,
      role: "owner",
      status: "active",
      joinedAt: Date.now(),
    });

    return teamId;
  },
});

export const generateTeamUploadUrl = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .unique();
    if (!membership || !(["owner", "admin"] as string[]).includes(membership.role)) {
      throw new Error("Not authorized");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    location: v.optional(v.string()),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    themeSettings: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    // Only owner or admin can update
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .unique();
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Not authorized");
    }

    const { teamId, ...updates } = args;
    // Build patch — only include defined values; normalize social URLs
    const patch: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined) continue;
      if (["twitterUrl", "linkedinUrl", "githubUrl", "website"].includes(key) && typeof val === "string") {
        const lower = val.trim().toLowerCase();
        if (lower && (lower.startsWith("javascript:") || lower.startsWith("data:"))) {
          throw new Error(`Invalid URL for ${key}`);
        }
      }
      patch[key] = val;
    }
    await ctx.db.patch(teamId, patch);
  },
});

export const inviteMember = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Validate email format
    const email = args.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      throw new Error("Invalid email address");
    }

    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .unique();
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Not authorized to invite members");
    }

    // Plan enforcement: only team plan owners can have teams
    const teamRecord = await ctx.db.get(args.teamId);
    if (teamRecord) {
      const ownerSub = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q: any) => q.eq("userId", teamRecord.ownerId))
        .unique();
      if (
        !ownerSub ||
        ownerSub.plan !== "team" ||
        (ownerSub.status !== "active" && ownerSub.status !== "trialing")
      ) {
        throw new Error("Team plan required to invite members");
      }
    }

    // Check seat count (Pro allows 5 seats on Team plan)
    const allMembers = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    if (allMembers.length >= 5) {
      throw new Error("Team seat limit reached (5 seats)");
    }

    // Check if already invited (use normalized email)
    const alreadyInvited = allMembers.find(
      (m) => m.inviteEmail?.toLowerCase() === email
    );
    if (alreadyInvited) throw new Error("This email has already been invited");

    await ctx.db.insert("teamMemberships", {
      teamId: args.teamId,
      userId: undefined,
      role: args.role,
      status: "invited",
      inviteEmail: email,
      joinedAt: Date.now(),
    });

    // Send invite email
    const team = await ctx.db.get(args.teamId);
    const inviterUser = await ctx.db.get(user._id);
    const inviterName = inviterUser && "firstName" in inviterUser
      ? [inviterUser.firstName, inviterUser.lastName].filter(Boolean).join(" ") || undefined
      : undefined;
    await ctx.scheduler.runAfter(0, internal.emails.sendTeamInvite, {
      email,
      teamName: team?.name ?? "a team",
      inviterName,
    });
  },
});

export const removeMember = mutation({
  args: {
    membershipId: v.id("teamMemberships"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) throw new Error("Membership not found");

    // Must be owner/admin to remove others
    const myMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", membership.teamId).eq("userId", user._id)
      )
      .unique();
    const canRemove =
      myMembership &&
      (myMembership.role === "owner" ||
        (myMembership.role === "admin" && membership.role === "member"));
    // Users can always remove themselves
    const isSelf = membership.userId === user._id;

    if (!canRemove && !isSelf) throw new Error("Not authorized");

    await ctx.db.delete(args.membershipId);
  },
});

export const leaveTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .unique();
    if (!membership) throw new Error("Not a member of this team");
    if (membership.role === "owner") {
      throw new Error(
        "Owners cannot leave — transfer ownership or delete the team first"
      );
    }

    await ctx.db.delete(membership._id);
  },
});
