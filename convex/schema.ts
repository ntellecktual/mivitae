import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    referralCode: v.optional(v.string()),
    referralCredits: v.optional(v.number()),
    isFoundingUser: v.optional(v.boolean()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_referralCode", ["referralCode"]),

  profiles: defineTable({
    userId: v.id("users"),
    slug: v.string(),
    displayName: v.optional(v.string()),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    avatarUrl: v.optional(v.string()),
    theme: v.optional(v.string()),
    themeConfig: v.optional(v.any()),
    viewCount: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_slug", ["slug"]),

  resumes: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    storageId: v.string(),
    parsedText: v.optional(v.string()),
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
      v.literal("error")
    ),
    uploadedAt: v.number(),
  }).index("by_userId", ["userId"]),

  portfolios: defineTable({
    userId: v.id("users"),
    profileId: v.id("profiles"),
    title: v.string(),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  portfolioSections: defineTable({
    portfolioId: v.id("portfolios"),
    userId: v.id("users"),
    companyName: v.string(),
    role: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    description: v.string(),
    skills: v.array(v.string()),
    achievements: v.array(v.string()),
    order: v.number(),
    demoIds: v.array(v.id("userDemos")),
  })
    .index("by_portfolioId", ["portfolioId"])
    .index("by_userId", ["userId"]),

  educationEntries: defineTable({
    userId: v.id("users"),
    portfolioId: v.id("portfolios"),
    institution: v.string(),
    degree: v.string(),
    fieldOfStudy: v.optional(v.string()),
    startYear: v.number(),
    endYear: v.optional(v.number()),
    gpa: v.optional(v.string()),
    honors: v.optional(v.string()),
    activities: v.array(v.string()),
    skills: v.optional(v.array(v.string())),
    relevantCoursework: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_portfolioId", ["portfolioId"]),

  certificates: defineTable({
    userId: v.id("users"),
    portfolioId: v.id("portfolios"),
    name: v.string(),
    issuer: v.string(),
    issueDate: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    credentialId: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_portfolioId", ["portfolioId"]),

  demoTemplates: defineTable({
    name: v.string(),
    category: v.string(),
    description: v.string(),
    thumbnailUrl: v.optional(v.string()),
    defaultContent: v.string(),
    htmlContent: v.optional(v.string()),
    previewImageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_category", ["category"]),

  userDemos: defineTable({
    userId: v.id("users"),
    templateId: v.optional(v.id("demoTemplates")),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    htmlContent: v.optional(v.string()),
    bannerStorageId: v.optional(v.id("_storage")),
    bannerUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    demoUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublic: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    plan: v.string(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  onboardingState: defineTable({
    userId: v.id("users"),
    currentStep: v.number(),
    completedSteps: v.array(v.number()),
    resumeId: v.optional(v.id("resumes")),
    isComplete: v.boolean(),
  }).index("by_userId", ["userId"]),

  demoEmbeddings: defineTable({
    demoId: v.id("userDemos"),
    embedding: v.array(v.float64()),
    textChunk: v.string(),
  }).index("by_demoId", ["demoId"]),

  profileViews: defineTable({
    profileId: v.id("profiles"),
    viewedAt: v.number(),
    referrer: v.optional(v.string()),
    country: v.optional(v.string()),
  })
    .index("by_profileId", ["profileId"])
    .index("by_profileId_viewedAt", ["profileId", "viewedAt"]),

  referrals: defineTable({
    referrerId: v.id("users"),
    referredUserId: v.id("users"),
    createdAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("credited")),
    creditedAt: v.optional(v.number()),
  })
    .index("by_referrerId", ["referrerId"])
    .index("by_referredUserId", ["referredUserId"]),

  teams: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    themeSettings: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_slug", ["slug"]),

  teamMemberships: defineTable({
    teamId: v.id("teams"),
    userId: v.optional(v.id("users")),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    status: v.union(v.literal("invited"), v.literal("active")),
    inviteEmail: v.optional(v.string()),
    joinedAt: v.number(),
  })
    .index("by_teamId", ["teamId"])
    .index("by_userId", ["userId"])
    .index("by_teamId_and_userId", ["teamId", "userId"]),

  webhookEvents: defineTable({
    eventId: v.string(),
    source: v.union(v.literal("clerk"), v.literal("stripe")),
    processedAt: v.number(),
  }).index("by_eventId", ["eventId"]),

  // Cache for AI-generated demos keyed by normalized role+skills+audience
  demoCache: defineTable({
    cacheKey: v.string(),        // normalized: "role||skill1,skill2,skill3||audience"
    html: v.string(),
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    hitCount: v.number(),        // how many times this cache entry was served
    createdAt: v.number(),
  }).index("by_cacheKey", ["cacheKey"]),

  // Skills showcase — standalone skills with proficiency for public profiles
  skills: defineTable({
    userId: v.id("users"),
    portfolioId: v.id("portfolios"),
    name: v.string(),
    category: v.string(),            // e.g. "Leadership", "Communication", "Analytics", "Design", "Sales & Marketing"
    proficiency: v.optional(v.number()), // 1-5 scale
    yearsOfExperience: v.optional(v.number()),
    order: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_portfolioId", ["portfolioId"]),

  // Volunteering entries for public profiles
  volunteeringEntries: defineTable({
    userId: v.id("users"),
    portfolioId: v.id("portfolios"),
    organization: v.string(),
    role: v.string(),
    cause: v.optional(v.string()),        // e.g. "Education", "Environment"
    startDate: v.string(),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_portfolioId", ["portfolioId"]),

  // Click tracking — granular analytics events on public profiles
  clickEvents: defineTable({
    profileId: v.id("profiles"),
    eventType: v.string(),               // "link_click", "demo_view", "section_scroll", "contact_click"
    target: v.optional(v.string()),      // URL or element identifier
    referrer: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_profileId", ["profileId"])
    .index("by_profileId_timestamp", ["profileId", "timestamp"]),

  // Contact/Hire Me messages from public profile visitors
  contactMessages: defineTable({
    profileId: v.id("profiles"),
    recipientUserId: v.id("users"),
    senderName: v.string(),
    senderEmail: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipientUserId", ["recipientUserId"])
    .index("by_profileId", ["profileId"])
    .index("by_senderEmail", ["senderEmail"]),

  // In-app notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),                    // "contact_message", "team_invite", "profile_view_milestone", "system"
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),        // Deep link within the app
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"]),

  // Email drip campaign tracking
  emailDrip: defineTable({
    userId: v.id("users"),
    emailKey: v.string(),                // "day1_setup", "day3_profile", "day7_demo", "day14_publish"
    sentAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_emailKey", ["userId", "emailKey"]),

  // ── v2: Verified Skill Scores ────────────────────────────────────────
  skillScores: defineTable({
    demoId: v.id("userDemos"),
    userId: v.id("users"),
    overallScore: v.number(),            // 0-100
    dimensions: v.object({
      technicalDepth: v.number(),        // 0-100 — Professional depth
      realWorldRelevance: v.number(),    // 0-100
      communicationClarity: v.number(),  // 0-100
      problemSolving: v.number(),        // 0-100
      innovation: v.number(),           // 0-100
    }),
    summary: v.string(),                 // One-paragraph assessment
    strengths: v.array(v.string()),      // Top 3 strengths
    improvements: v.array(v.string()),   // Top 3 improvement areas
    gradedAt: v.number(),
  })
    .index("by_demoId", ["demoId"])
    .index("by_userId", ["userId"])
    .index("by_userId_overallScore", ["userId", "overallScore"]),

  // ── v2: Public Showcase — featured portfolios/demos ──────────────────
  showcaseEntries: defineTable({
    userId: v.id("users"),
    profileId: v.id("profiles"),
    demoId: v.optional(v.id("userDemos")),
    featuredAt: v.number(),
    category: v.optional(v.string()),    // e.g. "engineering", "healthcare", "sales", "education", "finance", etc.
    curatorNote: v.optional(v.string()), // Editorial blurb
    isActive: v.boolean(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_category", ["category"]),
});
