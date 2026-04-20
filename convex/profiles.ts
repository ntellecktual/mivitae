import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { ensureAuthUser } from "./authHelpers";

// Reserved slugs that cannot be used as profile URLs
const RESERVED_SLUGS = new Set([
  "admin", "api", "app", "auth", "billing", "blog", "careers",
  "dashboard", "docs", "help", "login", "logout", "org", "pricing",
  "privacy", "profile", "settings", "sign-in", "sign-up", "signup",
  "signin", "sitemap", "status", "support", "terms", "u", "user",
  "users", "www", "about", "contact", "demo", "demos", "team",
  "teams", "referral", "referrals", "upload", "onboarding",
]);

function validateSlug(slug: string): string {
  const cleaned = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  if (cleaned.length < 3) throw new Error("Slug must be at least 3 characters");
  if (RESERVED_SLUGS.has(cleaned)) throw new Error(`"${cleaned}" is reserved. Choose another.`);
  return cleaned;
}

/** Block javascript: / data: URLs from being stored in profile link fields */
function validateUrl(url: string | undefined, fieldName: string): void {
  if (!url) return;
  if (url.length > 500) throw new Error(`${fieldName} too long (max 500)`);
  const lower = url.trim().toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!profile) return null;
    // Merge the Clerk imageUrl as a fallback avatar
    const user = await ctx.db.get(profile.userId);
    return {
      ...profile,
      avatarUrl: profile.avatarUrl ?? user?.imageUrl,
    };
  },
});

// Internal-only: used by the Clerk webhook / resume parser
export const createInternal = internalMutation({
  args: {
    userId: v.id("users"),
    slug: v.string(),
    displayName: v.optional(v.string()),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      throw new Error(`Slug "${args.slug}" is already taken.`);
    }

    return await ctx.db.insert("profiles", {
      ...args,
      isPublic: false,
    });
  },
});

// Internal-only: used by the Clerk webhook / server-side updates
export const updateInternal = internalMutation({
  args: {
    profileId: v.id("profiles"),
    displayName: v.optional(v.string()),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    avatarUrl: v.optional(v.string()),
    theme: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profileId, ...fields } = args;
    await ctx.db.patch(profileId, fields);
  },
});

// ── Auth-aware versions (used by the onboarding wizard UI) ───────────────

export const getSelf = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) return null;

    return {
      ...profile,
      avatarUrl: profile.avatarUrl ?? user.imageUrl,
    };
  },
});

export const checkSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return { available: !existing };
  },
});

export const upsertSelf = mutation({
  args: {
    slug: v.optional(v.string()),
    displayName: v.optional(v.string()),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    theme: v.optional(v.string()),
    themeConfig: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    // Validate input lengths
    if (args.headline && args.headline.length > 200) throw new Error("Headline too long (max 200)");
    if (args.bio && args.bio.length > 2000) throw new Error("Bio too long (max 2000)");
    if (args.location && args.location.length > 100) throw new Error("Location too long (max 100)");

    // Validate URLs
    validateUrl(args.websiteUrl, "Website URL");
    validateUrl(args.linkedinUrl, "LinkedIn URL");
    validateUrl(args.githubUrl, "GitHub URL");

    if (existing) {
      const { slug, ...fields } = args;
      if (slug && slug !== existing.slug) {
        const cleanSlug = validateSlug(slug);
        const slugTaken = await ctx.db
          .query("profiles")
          .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
          .unique();
        if (slugTaken) throw new Error(`Slug "${cleanSlug}" is already taken. Choose another.`);
        await ctx.db.patch(existing._id, { ...fields, slug: cleanSlug });
      } else {
        await ctx.db.patch(existing._id, fields);
      }
      return existing._id;
    }

    // New profile — generate slug from name
    const baseName =
      [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "user";
    const slug = validateSlug(args.slug ?? `${baseName}-${Math.floor(Math.random() * 9000) + 1000}`);

    const slugTaken = await ctx.db
      .query("profiles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (slugTaken) throw new Error(`Slug "${slug}" is already taken. Please choose another.`);

    return await ctx.db.insert("profiles", {
      userId: user._id,
      slug,
      displayName: args.displayName,
      headline: args.headline,
      bio: args.bio,
      location: args.location,
      websiteUrl: args.websiteUrl,
      linkedinUrl: args.linkedinUrl,
      githubUrl: args.githubUrl,
      isPublic: args.isPublic ?? false,
    });
  },
});

// ThemeConfig validator — mirrors src/lib/theme.ts ThemeConfig interface
const themeConfigValidator = v.object({
  bgType: v.union(v.literal("solid"), v.literal("gradient"), v.literal("pattern")),
  bgPrimary: v.string(),
  bgSecondary: v.string(),
  bgAngle: v.number(),
  patternType: v.union(v.literal("dots"), v.literal("grid"), v.literal("lines"), v.literal("cross"), v.literal("waves"), v.literal("hexagons"), v.literal("none")),
  patternColor: v.string(),
  accentColor: v.string(),
  textColor: v.string(),
  subtextColor: v.string(),
  cardBg: v.string(),
  cardBorder: v.string(),
  headingFont: v.string(),
  bodyFont: v.string(),
  heroLayout: v.union(v.literal("centered"), v.literal("left"), v.literal("split"), v.literal("minimal"), v.literal("card"), v.literal("magazine"), v.literal("banner"), v.literal("stacked"), v.literal("diagonal"), v.literal("floating")),
  cardStyle: v.union(v.literal("default"), v.literal("glass"), v.literal("bordered"), v.literal("flat"), v.literal("elevated"), v.literal("minimal"), v.literal("neon"), v.literal("retro"), v.literal("shadow-pop"), v.literal("outline")),
  containerWidth: v.union(v.literal("narrow"), v.literal("default"), v.literal("wide")),
  showExperience: v.boolean(),
  showEducation: v.boolean(),
  showDemos: v.boolean(),
  showSkills: v.boolean(),
  showVolunteering: v.boolean(),
  customCss: v.optional(v.string()),
  animationStyle: v.optional(v.union(v.literal("none"), v.literal("subtle"), v.literal("bold"), v.literal("playful"), v.literal("cinematic"), v.literal("stagger"))),
  // Pro fields
  bgGradientType: v.optional(v.union(v.literal("linear"), v.literal("radial"), v.literal("conic"))),
  bgGrainOverlay: v.optional(v.boolean()),
  bgGrainOpacity: v.optional(v.number()),
  hoverEffects: v.optional(v.union(v.literal("none"), v.literal("lift"), v.literal("glow"), v.literal("tilt"), v.literal("scale"))),
  pageTransition: v.optional(v.union(v.literal("none"), v.literal("fade"), v.literal("slide"), v.literal("morph"))),
  parallaxEnabled: v.optional(v.boolean()),
  showCertificates: v.optional(v.boolean()),
  showContact: v.optional(v.boolean()),
  darkMode: v.optional(v.object({
    enabled: v.boolean(),
    darkPalette: v.optional(v.object({
      bgPrimary: v.string(),
      bgSecondary: v.string(),
      textColor: v.string(),
      subtextColor: v.string(),
      cardBg: v.string(),
      cardBorder: v.string(),
      accentColor: v.string(),
    })),
  })),
  navStyle: v.optional(v.object({
    variant: v.union(v.literal("default"), v.literal("minimal"), v.literal("pills"), v.literal("underline")),
    position: v.union(v.literal("left"), v.literal("right"), v.literal("top")),
    width: v.union(v.literal("narrow"), v.literal("default"), v.literal("wide")),
    showLabels: v.boolean(),
    iconStyle: v.optional(v.union(v.literal("default"), v.literal("rounded"), v.literal("square"), v.literal("outline"))),
  })),

  buttonStyle: v.optional(v.union(v.literal("default"), v.literal("rounded"), v.literal("pill"), v.literal("outline"), v.literal("ghost"), v.literal("glow"))),
  imageFilter: v.optional(v.union(v.literal("none"), v.literal("grayscale"), v.literal("sepia"), v.literal("saturate"), v.literal("contrast"), v.literal("brightness"))),
  sectionSpacing: v.optional(v.union(v.literal("compact"), v.literal("comfortable"), v.literal("spacious"))),
  socialIconStyle: v.optional(v.union(v.literal("default"), v.literal("rounded"), v.literal("square"), v.literal("pill"), v.literal("outline"), v.literal("glow"))),

  splashScreen: v.optional(v.object({
    enabled: v.boolean(),
    style: v.optional(v.union(v.literal("fade"), v.literal("slide-up"), v.literal("zoom"), v.literal("blur"))),
    bgColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    duration: v.optional(v.number()),
  })),
  fontScale: v.optional(v.union(v.literal("small"), v.literal("medium"), v.literal("large"))),
});

export const saveTheme = mutation({
  args: { themeConfig: themeConfigValidator },
  handler: async (ctx, args) => {
    const user = await ensureAuthUser(ctx);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, { themeConfig: args.themeConfig });
  },
});

export const listPublicSlugs = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").take(10000);
    return profiles
      .filter((p) => p.isPublic)
      .map((p) => ({ slug: p.slug, updatedAt: p._creationTime }));
  },
});

export const listPublicGallery = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").take(500);
    const results = await Promise.all(
      profiles
        .filter((p) => p.isPublic && p.headline)
        .map(async (p) => {
          const user = await ctx.db.get(p.userId);
          return {
            slug: p.slug,
            headline: p.headline,
            bio: p.bio?.slice(0, 120),
            location: p.location,
            avatarUrl: p.avatarUrl ?? user?.imageUrl,
            viewCount: p.viewCount ?? 0,
          };
        })
    );
    return results
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 50);
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get storage URL");

    await ctx.db.patch(profile._id, { avatarUrl: url });
    return url;
  },
});

/**
 * Backfill: copy users.imageUrl → profiles.avatarUrl for all profiles.
 * Forces overwrite so any stale local or storage URLs are replaced with the Clerk photo.
 * Run: npx convex run profiles:backfillAvatars --prod
 */
export const backfillAvatars = internalMutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    let updated = 0;
    for (const p of profiles) {
      const user = await ctx.db.get(p.userId);
      if (user?.imageUrl && user.imageUrl !== p.avatarUrl) {
        await ctx.db.patch(p._id, { avatarUrl: user.imageUrl });
        updated++;
      }
    }
    console.log(`Backfilled avatarUrl for ${updated}/${profiles.length} profiles`);
    return { updated, total: profiles.length };
  },
});
