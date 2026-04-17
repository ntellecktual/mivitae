import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Basic email format check — not exhaustive but catches obvious junk
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Strip HTML to prevent XSS when displaying messages */
function sanitizeText(text: string, maxLen: number): string {
  return text
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLen);
}

// Public — anyone viewing a profile can send a message
export const send = mutation({
  args: {
    profileId: v.id("profiles"),
    senderName: v.string(),
    senderEmail: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile || !profile.isPublic) throw new Error("Profile not found");

    if (!args.senderName.trim()) throw new Error("Name is required");
    if (!isValidEmail(args.senderEmail)) throw new Error("Invalid email address");
    if (!args.message.trim() || args.message.length > 5000) {
      throw new Error("Message must be between 1 and 5000 characters");
    }

    // Rate limit: max 5 messages per profile per hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentMessages = await ctx.db
      .query("contactMessages")
      .withIndex("by_profileId", (q) => q.eq("profileId", args.profileId))
      .take(100);
    const recentCount = recentMessages.filter(m => m.createdAt > oneHourAgo).length;
    if (recentCount >= 5) throw new Error("Too many messages. Please try again later.");

    const messageId = await ctx.db.insert("contactMessages", {
      profileId: args.profileId,
      recipientUserId: profile.userId,
      senderName: sanitizeText(args.senderName, 100),
      senderEmail: args.senderEmail.trim().slice(0, 254),
      message: sanitizeText(args.message, 5000),
      isRead: false,
      createdAt: Date.now(),
    });

    // Create in-app notification for the recipient
    await ctx.db.insert("notifications", {
      userId: profile.userId,
      type: "contact_message",
      title: "New message",
      body: `${sanitizeText(args.senderName, 50)} sent you a message`,
      link: "/dashboard/messages",
      isRead: false,
      createdAt: Date.now(),
    });

    // Forward via email
    const user = await ctx.db.get(profile.userId);
    if (user?.email) {
      await ctx.scheduler.runAfter(0, internal.emails.sendContactForward, {
        recipientEmail: user.email,
        senderName: sanitizeText(args.senderName, 100),
        senderEmail: args.senderEmail.trim().slice(0, 254),
        message: sanitizeText(args.message, 5000),
      });
    }

    return messageId;
  },
});

// Auth-aware — get own messages
export const getSelfMessages = query({
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
      .query("contactMessages")
      .withIndex("by_recipientUserId", (q) => q.eq("recipientUserId", user._id))
      .order("desc")
      .take(100);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return 0;

    const messages = await ctx.db
      .query("contactMessages")
      .withIndex("by_recipientUserId", (q) => q.eq("recipientUserId", user._id))
      .take(500);

    return messages.filter(m => !m.isRead).length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const msg = await ctx.db.get(args.id);
    if (!msg || msg.recipientUserId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { isRead: true });
  },
});
