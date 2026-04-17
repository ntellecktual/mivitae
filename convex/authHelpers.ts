import { MutationCtx, QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Shared helper to look up the authenticated user. Returns the user doc or
 * null (for queries) / throws (for mutations) when not authenticated.
 *
 * For mutations: when the Clerk webhook or ConvexUserSync haven't completed
 * yet, this auto-creates the user record from the auth identity so callers
 * never see "User not found".
 */

export async function getAuthUser(
  ctx: QueryCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export async function ensureAuthUser(
  ctx: MutationCtx,
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (existing) return existing;

  // Auto-create user record (webhook/sync hasn't completed yet)
  const email =
    identity.email ??
    (typeof identity.tokenIdentifier === "string"
      ? identity.tokenIdentifier
      : "unknown@unknown.com");
  const userId = await ctx.db.insert("users", {
    clerkId: identity.subject,
    email,
    firstName: identity.givenName,
    lastName: identity.familyName,
    imageUrl: identity.pictureUrl,
    createdAt: Date.now(),
  });
  return (await ctx.db.get(userId))!;
}
