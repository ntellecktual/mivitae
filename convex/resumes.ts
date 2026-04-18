import { v } from "convex/values";
import { query, mutation, internalMutation, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUserPlan, getLimits } from "./planLimits";
import { ensureAuthUser } from "./authHelpers";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    // Validate file name length
    if (args.fileName.length > 255) throw new Error("File name too long");

    // Limit total resumes per user (plan-aware)
    const plan = await getUserPlan(ctx, user._id);
    const maxResumes = plan === "free" ? 5 : 20;
    const existingResumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(maxResumes + 1);
    if (existingResumes.length >= maxResumes) {
      throw new Error(
        `You've reached the ${plan} plan limit of ${maxResumes} resumes. Delete old ones or upgrade.`
      );
    }

    return await ctx.db.insert("resumes", {
      userId: user._id,
      storageId: args.storageId,
      fileName: args.fileName.slice(0, 255),
      parseStatus: "pending",
      uploadedAt: Date.now(),
    });
  },
});

// Internal only — no frontend callers
export const getByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
  },
});

export const getLatest = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Auth gate — only allow fetching your own resumes
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});

// Converted to internal — only server-side code should update parse status
export const updateStatus = internalMutation({
  args: {
    resumeId: v.id("resumes"),
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
      v.literal("error")
    ),
    parsedText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { resumeId, ...fields } = args;
    await ctx.db.patch(resumeId, fields);
  },
});

// Internal mutation called by the resumeParser action
export const setParseStatus = internalMutation({
  args: {
    resumeId: v.id("resumes"),
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
      v.literal("error")
    ),
    parsedText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { resumeId, ...fields } = args;
    await ctx.db.patch(resumeId, fields);
  },
});

// Public action: triggers resume parsing after upload
export const triggerParse = internalAction({
  args: {
    resumeId: v.id("resumes"),
    storageId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.resumeParser.parseResume, args);
  },
});

// Public-facing action kicked off from the client after upload
export const startParse = mutation({
  args: {
    resumeId: v.id("resumes"),
    storageId: v.string(),
    fileType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    // Verify resume belongs to this user
    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userId !== user._id) {
      throw new Error("Resume not found or not owned by you");
    }

    // Rate limit: only allow parsing if not already processing
    if (resume.parseStatus === "processing") {
      throw new Error("Resume is already being parsed");
    }

    // Plan-based daily parse limit
    const plan = await getUserPlan(ctx, user._id);
    const limits = getLimits(plan);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentResumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(limits.maxResumeParsesPerDay + 1);
    const parsesToday = recentResumes.filter(
      (r) => r.uploadedAt > oneDayAgo && r.parseStatus !== "error"
    ).length;
    if (parsesToday > limits.maxResumeParsesPerDay) {
      throw new Error(
        `Daily parse limit reached (${limits.maxResumeParsesPerDay}/day on ${plan} plan). Try again tomorrow or upgrade.`
      );
    }

    await ctx.scheduler.runAfter(0, internal.resumeParser.parseResume, {
      resumeId: args.resumeId,
      storageId: args.storageId,
      userId: user._id,
      fileType: args.fileType,
    });
  },
});

/**
 * Parse resume from pasted text (LinkedIn profile copy-paste, etc.)
 */
export const startTextParse = mutation({
  args: {
    text: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    if (args.text.trim().length < 50) {
      throw new Error("Text too short — paste at least 50 characters");
    }
    if (args.text.length > 100000) {
      throw new Error("Text too long (max 100KB)");
    }

    // Rate limit (same as file parse)
    const plan = await getUserPlan(ctx, user._id);
    const limits = getLimits(plan);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentResumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(limits.maxResumeParsesPerDay + 1);
    const parsesToday = recentResumes.filter(
      (r) => r.uploadedAt > oneDayAgo && r.parseStatus !== "error"
    ).length;
    if (parsesToday > limits.maxResumeParsesPerDay) {
      throw new Error(
        `Daily parse limit reached (${limits.maxResumeParsesPerDay}/day on ${plan} plan).`
      );
    }

    // Create resume record (no storage needed for text — passed directly)
    const source = args.source || "Pasted text";
    const resumeId = await ctx.db.insert("resumes", {
      userId: user._id,
      storageId: "text_paste",
      fileName: `${source}.txt`,
      parseStatus: "pending",
      uploadedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.resumeParser.parseResume, {
      resumeId,
      storageId: "text_paste",
      userId: user._id,
      fileType: "text",
      rawText: args.text,
    });

    return resumeId;
  },
});
