# mivitae — Living Portfolio Platform
### Development Specification & Continuation Guide

> **mi vitae** (/miː ˈvɪtaɪ/) — Latin: "my life"
>
> A SaaS platform where anyone uploads a résumé and receives an auto-generated,
> living portfolio: verified work history, education timeline, and industry-specific
> interactive demo cards — all publicly shareable at `mivitae.io/u/[slug]`.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Tech Stack](#2-tech-stack)
3. [Repository Layout](#3-repository-layout)
4. [Environment Variables](#4-environment-variables)
5. [Data Model (Convex Schema)](#5-data-model-convex-schema)
6. [Convex Backend Functions](#6-convex-backend-functions)
7. [Application Routes](#7-application-routes)
8. [Build Status](#8-build-status)
9. [Phase Roadmap](#9-phase-roadmap)
10. [Architecture Notes](#10-architecture-notes)
11. [Deployment](#11-deployment)
12. [Commands Reference](#12-commands-reference)

---

## 1. Product Vision

mivitae transforms a static résumé document into a dynamic, shareable, living portfolio.
The core user journey is:

```
Upload résumé (PDF)
        ↓
Claude AI extracts: work history, education, skills, projects
        ↓
User reviews & enriches each section via a guided wizard
        ↓
Platform generates a beautiful public profile at /u/[slug]
        ↓
Each job entry / education entry links to interactive demo cards
(live coding sandboxes, architecture diagrams, case study write-ups)
        ↓
User shares profile link • Employers / clients visit • Everyone impressed
```

### Business Model

| Tier | Price | Features |
|------|-------|---------|
| Free (30-day trial) | $0 | Full feature access, 1 portfolio, 3 demo cards |
| Pro | $12/month | Unlimited portfolios, unlimited demos, custom slug, analytics |
| Team | $49/month | 5 seats, shared demo library, white-label subdomain |

Payments: Stripe Subscriptions with Stripe Customer Portal for self-service management.

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js App Router | 16.2.4 | Uses `src/proxy.ts` (Next.js 16 pattern) |
| Language | TypeScript | ^5 | Strict mode enabled |
| Runtime | React | 19.2.4 | Server + Client components |
| UI Primitives | shadcn/ui + @base-ui/react | 4.2.0 | 10 components installed |
| Styling | Tailwind CSS | ^4 | CSS variables for theming, `@tailwindcss/postcss` |
| Icons | lucide-react | ^1.8.0 | |
| Backend | Convex (serverless, realtime) | 1.35.1 | Deployment: `dev:vivid-dotterel-7` |
| Authentication | Clerk | 7.2.1 | JWT provider for Convex, webhook sync |
| Payments | Stripe | 22.0.1 | API version `2026-03-25.dahlia` |
| Stripe Client | @stripe/stripe-js | ^9.2.0 | Client-side Stripe.js |
| AI (resume parsing) | @anthropic-ai/sdk | ^0.89.0 | Claude model for PDF extraction |
| PDF Parsing | pdf-parse | 2.4.5 | |
| Webhook Verification | svix | ^1.90.0 | Clerk webhook signature verification |
| Deployment | Vercel | — | |

### Architecture Decisions

**Why Convex?** — Chosen over Supabase/Prisma/PlanetScale for:
1. **Realtime by default** — WebSocket subscriptions, no polling needed.
2. **Functions-as-backend** — queries, mutations, actions run server-side with full type safety.
3. **No SQL migrations** — schema deploys automatically from `convex/schema.ts`.

**Why Claude for resume parsing?** — Native PDF document API support. Uses `claude-opus-4-5` model with structured JSON extraction.

**Why `src/proxy.ts`?** — Next.js 16 renamed middleware to proxy. Uses Clerk's `clerkMiddleware` with `createRouteMatcher` pattern.

---

## 3. Repository Layout

```
mivitae/
├── convex/                         # Convex backend
│   ├── schema.ts                   # ✅ 11 tables, 16+ indexes
│   ├── auth.config.ts              # ✅ Clerk JWT issuer config
│   ├── http.ts                     # ✅ HTTP routes (Clerk + Stripe webhooks)
│   ├── users.ts                    # ✅ User CRUD (Clerk sync)
│   ├── profiles.ts                 # ✅ Profile CRUD (getSelf, upsertSelf, slug lookup)
│   ├── resumes.ts                  # ✅ Resume upload + parse trigger
│   ├── resumeParser.ts             # ✅ Claude AI PDF extraction (internalAction)
│   ├── onboarding.ts               # ✅ Wizard state management (6 steps)
│   ├── portfolios.ts               # ✅ Portfolio CRUD (ensureDefault)
│   ├── portfolioSections.ts        # ✅ Work history sections (auth-aware CRUD + demo linking)
│   ├── educationEntries.ts         # ✅ Education entries (auth-aware CRUD)
│   ├── demos.ts                    # ✅ Demo cards + template management
│   ├── seedDemoTemplates.ts        # ✅ 14 demo templates (run-once seed)
│   ├── subscriptions.ts            # ✅ Stripe subscription sync
│   ├── stripeActions.ts            # ✅ Stripe Checkout + Portal + webhook handler ("use node")
│   ├── stripeHelpers.ts            # ✅ Internal queries for Stripe actions
│   └── _generated/                 # AUTO — never edit
│       └── ai/guidelines.md        # Convex AI agent guidelines
│
├── src/
│   ├── proxy.ts                    # ✅ Clerk middleware (Next.js 16 proxy pattern)
│   ├── app/
│   │   ├── layout.tsx              # ✅ Root layout (Geist fonts, metadata, Providers)
│   │   ├── globals.css             # ✅ Tailwind CSS base + theme variables
│   │   │
│   │   ├── (marketing)/            # Public routes
│   │   │   ├── layout.tsx          # ✅ Marketing header + footer shell
│   │   │   └── page.tsx            # ✅ Landing page (hero, how-it-works, features)
│   │   │
│   │   ├── sign-in/[[...sign-in]]/ # ✅ Clerk sign-in UI
│   │   ├── sign-up/[[...sign-up]]/ # ✅ Clerk sign-up UI
│   │   │
│   │   ├── (dashboard)/            # Protected routes (requires Clerk session)
│   │   │   ├── layout.tsx          # ✅ Sidebar + topbar shell (client component)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx        # ✅ Overview (onboarding banner, resume status, quick actions)
│   │   │       ├── upload/         # ✅ Resume upload + parse status tracking
│   │   │       ├── onboarding/     # ✅ 6-step wizard (profile→upload→review→portfolio→education→publish)
│   │   │       ├── portfolio/      # ✅ Work history inline editor + demo linking
│   │   │       ├── education/      # ✅ Education inline editor
│   │   │       ├── demos/          # ✅ Demo card manager (My Demos + Template Library tabs)
│   │   │       ├── profile/        # ✅ Profile editor (headline, bio, social links, theme)
│   │   │       └── settings/       # ✅ Account info + subscription/billing management
│   │   │
│   │   ├── u/[slug]/               # ✅ Public portfolio page (shareable)
│   │   │
│   │   └── api/
│   │       ├── webhooks/clerk/     # ✅ Clerk → Convex user sync
│   │       └── stripe/webhook/     # ✅ Stripe → Convex subscription sync
│   │
│   ├── components/
│   │   ├── providers.tsx           # ✅ ClerkProvider + ConvexProviderWithClerk + ConvexUserSync
│   │   └── ui/                     # ✅ 10 shadcn/ui components
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       └── textarea.tsx
│   │
│   └── lib/
│       ├── convex.ts               # ✅ Barrel re-export of convex/_generated/api
│       └── utils.ts                # ✅ cn() helper (clsx + tailwind-merge)
│
├── DEVELOPMENT.md                  # This file
├── README.md                       # Project overview + setup guide
├── AGENTS.md                       # AI agent instructions
├── CLAUDE.md                       # Claude-specific agent config
├── package.json
├── tsconfig.json                   # Strict, paths: @/* → ./src/*
├── next.config.ts                  # Next.js config (defaults)
├── components.json                 # shadcn/ui config (base-nova style, Tailwind v4)
├── eslint.config.mjs               # ESLint (Next.js core web vitals + TypeScript)
└── postcss.config.mjs              # @tailwindcss/postcss plugin
```

---

## 4. Environment Variables

### `.env.local` (Next.js — local development)

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/onboarding

# Stripe (Next.js API route)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=price_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Convex Dashboard Environment Variables

These must also be set in the Convex dashboard (Settings → Environment Variables):

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
```

### Vercel Environment Variables

All `.env.local` variables must be added to Vercel dashboard (Settings → Environment Variables). Never commit `.env.local`.

---

## 5. Data Model (Convex Schema)

All tables defined in `convex/schema.ts`. The schema is deployed to Convex.

### `users`
Mirrors Clerk user records. Synced via webhook on `user.created` / `user.updated` / `user.deleted`.

| Field | Type | Notes |
|-------|------|-------|
| clerkId | string | Clerk user ID |
| email | string | Primary email |
| firstName | string? | |
| lastName | string? | |
| imageUrl | string? | Clerk profile picture |
| createdAt | number | Unix timestamp |

**Indexes:** `by_clerkId` (clerkId), `by_email` (email)

### `profiles`
Public-facing identity for each user.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | FK → users |
| slug | string | URL slug — e.g. `john-doe-42` |
| headline | string? | "Senior Engineer @ Stripe" |
| bio | string? | Professional summary |
| location | string? | "San Francisco, CA" |
| websiteUrl | string? | Personal site |
| linkedinUrl | string? | |
| githubUrl | string? | |
| isPublic | boolean | Whether /u/[slug] is visible |
| avatarUrl | string? | Overrides Clerk image |
| theme | string? | Portfolio color theme |

**Indexes:** `by_userId` (userId), `by_slug` (slug)

### `resumes`
Uploaded résumé documents.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | |
| fileName | string | Original filename |
| storageId | string | Convex file storage ID |
| parsedText | string? | Raw text extracted from PDF |
| parseStatus | string | "pending" \| "processing" \| "done" \| "error" |
| uploadedAt | number | Unix timestamp |

**Indexes:** `by_userId` (userId)

### `portfolios`
One portfolio per user (extensible to multiple).

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | |
| profileId | Id<"profiles"> | |
| title | string | Portfolio display name |
| isDefault | boolean | Primary portfolio |
| createdAt | number | |
| updatedAt | number | |

**Indexes:** `by_userId` (userId)

### `portfolioSections`
Work experience entries within a portfolio.

| Field | Type | Notes |
|-------|------|-------|
| portfolioId | Id<"portfolios"> | |
| userId | Id<"users"> | |
| companyName | string | "Stripe", "Google" |
| role | string | "Senior Software Engineer" |
| startDate | string | "2021-03" (YYYY-MM) |
| endDate | string? | null = current role |
| description | string | Summary of role |
| skills | string[] | Tag list |
| achievements | string[] | Bullet points |
| order | number | Display order |
| demoIds | Id<"userDemos">[] | Linked demo cards |

**Indexes:** `by_portfolioId` (portfolioId), `by_userId` (userId)

### `educationEntries`
Education history entries.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | |
| portfolioId | Id<"portfolios"> | |
| institution | string | "MIT", "Stanford" |
| degree | string | "B.S. Computer Science" |
| fieldOfStudy | string? | |
| startYear | number | |
| endYear | number? | null = in progress |
| gpa | string? | |
| honors | string? | "Summa Cum Laude" |
| activities | string[] | Clubs, sports, orgs |
| order | number | Display order |

**Indexes:** `by_userId` (userId), `by_portfolioId` (portfolioId)

### `demoTemplates`
System-defined reusable demo blueprints (14 seeded templates across 5 categories).

| Field | Type | Notes |
|-------|------|-------|
| name | string | "REST API Design", "ML Pipeline" |
| category | string | "backend", "ml", "frontend", "data", "devops" |
| description | string | What this demo shows |
| thumbnailUrl | string? | |
| defaultContent | string | JSON config / starter code |
| isActive | boolean | |

**Indexes:** `by_category` (category)

### `userDemos`
A user's instantiated demo card, based on a template.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | |
| templateId | Id<"demoTemplates"> | |
| title | string | User-customized title |
| description | string | Context for this demo |
| content | string | JSON — template-specific payload |
| isPublic | boolean | Visible on public portfolio |
| createdAt | number | |

**Indexes:** `by_userId` (userId)

### `subscriptions`
Stripe subscription record, synced via webhook.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | |
| stripeCustomerId | string | `cus_...` |
| stripeSubscriptionId | string | `sub_...` |
| status | string | "active", "trialing", "canceled", "past_due" |
| plan | string | "free", "pro", "team" |
| currentPeriodEnd | number | Unix timestamp |
| cancelAtPeriodEnd | boolean | |

**Indexes:** `by_userId` (userId), `by_stripeSubscriptionId` (stripeSubscriptionId), `by_stripeCustomerId` (stripeCustomerId)

### `onboardingState`
Tracks onboarding wizard progress.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | |
| currentStep | number | 0–5 |
| completedSteps | number[] | [0, 1, 2, ...] |
| resumeId | Id<"resumes">? | Set after upload |
| isComplete | boolean | Redirect to dashboard when true |

**Indexes:** `by_userId` (userId)

### `demoEmbeddings`
Vector embeddings for demo content (future: semantic search / AI recommendations).

| Field | Type | Notes |
|-------|------|-------|
| demoId | Id<"userDemos"> | |
| embedding | float64[] | 1536-dim vector |
| textChunk | string | Source text chunk |

**Indexes:** `by_demoId` (demoId)

---

## 6. Convex Backend Functions

### `users.ts`
| Function | Type | Description |
|----------|------|-------------|
| `getByClerkId` | query | Get user by Clerk ID |
| `upsertFromClerk` | internalMutation | Sync user from Clerk webhook |
| `deleteByClerkId` | internalMutation | Delete user by Clerk ID |
| `upsertSelf` | mutation | Client-callable upsert for authenticated user |

### `profiles.ts`
| Function | Type | Description |
|----------|------|-------------|
| `getSelf` | query | Get authenticated user's profile |
| `getByUserId` | query | Get profile by user ID |
| `getBySlug` | query | Get profile by slug (public lookup) |
| `checkSlug` | query | Check if slug is available |
| `upsertSelf` | mutation | Create or update authenticated user's profile |
| `createInternal` | internalMutation | Create profile (used by webhook) |
| `updateInternal` | internalMutation | Update profile fields (internal only) |

### `resumes.ts`
| Function | Type | Description |
|----------|------|-------------|
| `generateUploadUrl` | mutation | Generate Convex storage upload URL |
| `create` | mutation | Create resume record |
| `getByUserId` | query | Get user's resumes (last 10) |
| `getLatest` | query | Get user's latest resume |
| `updateStatus` | mutation | Update resume parse status |
| `setParseStatus` | internalMutation | Set parse status (internal) |
| `startParse` | mutation | Start parsing after upload |
| `triggerParse` | internalAction | Trigger resume parsing action |

### `resumeParser.ts`
| Function | Type | Description |
|----------|------|-------------|
| `parseResume` | internalAction | Parse PDF using Claude AI, extract work/education into structured JSON |

### `onboarding.ts`
| Function | Type | Description |
|----------|------|-------------|
| `getSelf` | query | Get authenticated user's onboarding state |
| `getState` | query | Get onboarding state by user ID |
| `initializeSelf` | mutation | Initialize onboarding for authenticated user |
| `initialize` | mutation | Initialize onboarding state |
| `updateStep` | mutation | Update current onboarding step |
| `markStepComplete` | mutation | Mark step as completed |
| `complete` | mutation | Mark onboarding complete |

### `portfolios.ts`
| Function | Type | Description |
|----------|------|-------------|
| `getSelf` | query | Get authenticated user's portfolio |
| `ensureDefault` | mutation | Create default portfolio if none exists |
| `ensureDefaultInternal` | internalMutation | Create default portfolio (internal, for actions) |

### `portfolioSections.ts`
| Function | Type | Description |
|----------|------|-------------|
| `getSelfSections` | query | Get authenticated user's portfolio sections |
| `getByUserId` | query | Get sections by user ID |
| `getByPortfolioId` | query | Get sections by portfolio ID |
| `createSelf` | mutation | Create section (auth-aware) |
| `updateSelf` | mutation | Update section (auth-aware) |
| `removeSelf` | mutation | Delete section (auth-aware) |
| `linkDemo` | mutation | Link a demo card to a section |
| `unlinkDemo` | mutation | Unlink a demo card from a section |
| `createInternal` | internalMutation | Create section (for resume parser) |

### `educationEntries.ts`
| Function | Type | Description |
|----------|------|-------------|
| `getSelfEntries` | query | Get authenticated user's education entries |
| `getByUserId` | query | Get entries by user ID |
| `createSelf` | mutation | Create entry (auth-aware) |
| `updateSelf` | mutation | Update entry (auth-aware) |
| `removeSelf` | mutation | Delete entry (auth-aware) |
| `createInternal` | internalMutation | Create entry (for resume parser) |

### `demos.ts`
| Function | Type | Description |
|----------|------|-------------|
| `listTemplates` | query | List all active demo templates |
| `listTemplatesByCategory` | query | List templates by category |
| `getTemplate` | query | Get single template by ID |
| `seedTemplate` | internalMutation | Seed demo template (internal) |
| `getSelfDemos` | query | Get authenticated user's demos |
| `getByUserId` | query | Get user's demos by user ID |
| `getDemo` | query | Get single demo by ID |
| `createSelf` | mutation | Create demo (auth-aware) |
| `updateSelf` | mutation | Update demo (auth-aware) |
| `removeSelf` | mutation | Delete demo (auth-aware) |

### `subscriptions.ts`
| Function | Type | Description |
|----------|------|-------------|
| `getSelf` | query | Get authenticated user's subscription |
| `getByUserId` | query | Get subscription by user ID |
| `upsertFromStripe` | internalMutation | Upsert subscription from Stripe webhook |
| `updateFromStripe` | internalMutation | Update subscription from Stripe webhook |
| `deleteByStripeSubscriptionId` | internalMutation | Delete subscription by Stripe ID |
| `getUserByStripeCustomerId` | internalQuery | Lookup user by Stripe customer ID |

### `stripeActions.ts` (`"use node"`)
| Function | Type | Description |
|----------|------|-------------|
| `handleWebhookEvent` | internalAction | Handle Stripe webhook events (checkout, subscription updates/deletes) |
| `createCheckoutSession` | action | Create Stripe Checkout session with 30-day trial |
| `createPortalSession` | action | Create Stripe Customer Portal session |

### `stripeHelpers.ts`
| Function | Type | Description |
|----------|------|-------------|
| `getUserByClerkId` | internalQuery | Lookup user by Clerk ID (for Stripe actions) |
| `getSubscriptionByUserId` | internalQuery | Lookup subscription by user ID (for Stripe actions) |

### `seedDemoTemplates.ts`
| Function | Type | Description |
|----------|------|-------------|
| `seed` | internalMutation | Seed 14 demo templates across 5 categories |

### `http.ts`
| Route | Method | Description |
|-------|--------|-------------|
| `/clerk-webhook` | POST | Clerk user events → `users.upsertFromClerk` / `deleteByClerkId` |
| `/stripe-webhook` | POST | Stripe events → `stripeActions.handleWebhookEvent` |

---

## 7. Application Routes

### Public Routes (no auth required)

| Path | Component | Status | Description |
|------|-----------|--------|-------------|
| `/` | `(marketing)/page.tsx` | ✅ | Landing page (hero, how-it-works, features) |
| `/sign-in` | `sign-in/[[...sign-in]]/page.tsx` | ✅ | Clerk sign-in UI |
| `/sign-up` | `sign-up/[[...sign-up]]/page.tsx` | ✅ | Clerk sign-up UI |
| `/u/[slug]` | `u/[slug]/page.tsx` | ✅ | Public portfolio (profile + sections + education + demos) |

### Protected Routes (requires Clerk session)

| Path | Component | Status | Description |
|------|-----------|--------|-------------|
| `/dashboard` | `dashboard/page.tsx` | ✅ | Overview — onboarding banner, resume status, quick actions |
| `/dashboard/upload` | `dashboard/upload/page.tsx` | ✅ | Resume upload with parse status tracking |
| `/dashboard/onboarding` | `dashboard/onboarding/page.tsx` | ✅ | 6-step wizard |
| `/dashboard/portfolio` | `dashboard/portfolio/page.tsx` | ✅ | Work history inline editor + demo linking |
| `/dashboard/education` | `dashboard/education/page.tsx` | ✅ | Education inline editor |
| `/dashboard/demos` | `dashboard/demos/page.tsx` | ✅ | Demo card manager (My Demos + Template Library) |
| `/dashboard/profile` | `dashboard/profile/page.tsx` | ✅ | Profile editor (headline, bio, links, theme) |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | ✅ | Account info + billing/subscription management |

### API Routes

| Path | Method | Status | Description |
|------|--------|--------|-------------|
| `/api/webhooks/clerk` | POST | ✅ | Clerk → Convex user sync (svix verification) |
| `/api/stripe/webhook` | POST | ✅ | Stripe → Convex subscription sync (signature verification) |

---

## 8. Build Status

### Current State: ✅ Clean build

```bash
npx convex dev --once    # ✅ "Convex functions ready!"
npx next build           # ✅ 0 TypeScript errors, all pages static/dynamic as expected
```

**Build output:**
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/stripe/webhook
├ ƒ /api/webhooks/clerk
├ ○ /dashboard
├ ○ /dashboard/demos
├ ○ /dashboard/education
├ ○ /dashboard/onboarding
├ ○ /dashboard/portfolio
├ ○ /dashboard/profile
├ ○ /dashboard/settings
├ ○ /dashboard/upload
├ ƒ /sign-in/[[...sign-in]]
├ ƒ /sign-up/[[...sign-up]]
└ ƒ /u/[slug]

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### Setup Required (Not Bugs)

To make Stripe billing functional, the following env vars must be set with real values:
- `STRIPE_SECRET_KEY` — in `.env.local` AND Convex dashboard
- `STRIPE_WEBHOOK_SECRET` — in `.env.local`
- `STRIPE_PRO_PRICE_ID` / `STRIPE_TEAM_PRICE_ID` — in Convex dashboard
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` / `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID` — in `.env.local`
- `NEXT_PUBLIC_APP_URL` — in `.env.local` AND Convex dashboard

---

## 9. Phase Roadmap

```
Phase 1 — Foundation                    [✅ COMPLETE]
  ✅ Next.js 16 + TypeScript scaffold
  ✅ Tailwind CSS v4 + shadcn/ui
  ✅ Convex backend + schema (11 tables)
  ✅ Clerk authentication (sign-in, sign-up, webhook sync, middleware)
  ✅ Dashboard layout (sidebar, topbar, mobile hamburger)
  ✅ Marketing landing page (hero, features, how-it-works)

Phase 2 — Onboarding Wizard            [✅ COMPLETE]
  ✅ 6-step guided flow (profile → upload → review → portfolio → education → publish)
  ✅ Persistent state in Convex
  ✅ Stepper UI with back/next/skip navigation
  ✅ Auto-redirect when complete

Phase 3 — Resume Parsing & AI          [✅ COMPLETE]
  ✅ PDF upload to Convex file storage
  ✅ Claude AI extraction (work history, education, skills)
  ✅ Structured JSON output → Convex mutations
  ✅ Parse status tracking (pending → processing → done)

Phase 4 — Public Portfolio              [✅ COMPLETE]
  ✅ /u/[slug] page with profile, work history, education, demo cards
  ✅ Profile editor (headline, bio, location, social links, theme)
  ✅ Slug selection and availability check

Sprint 1 — Inline Editing              [✅ COMPLETE]
  ✅ Work history inline editor with create/edit/delete
  ✅ Education inline editor with create/edit/delete
  ✅ Profile editor with all fields
  ✅ Demo card linking to portfolio sections

Sprint 2 — Demo Cards                  [✅ COMPLETE]
  ✅ 14 demo templates seeded across 5 categories (backend, frontend, ml, data, devops)
  ✅ Two-tab UI (My Demos + Template Library)
  ✅ Create/edit/delete demo cards
  ✅ Link/unlink demos to portfolio sections
  ✅ Public portfolio displays linked demos

Sprint 3 — Stripe Billing              [✅ COMPLETE]
  ✅ Stripe Checkout session creation (with 30-day trial)
  ✅ Stripe Customer Portal session
  ✅ Webhook processing (checkout.session.completed, subscription.updated, subscription.deleted)
  ✅ Subscription sync to Convex (upsert/update/delete)
  ✅ Settings page with account info, plan cards, billing management
  ✅ Security: removed all unsafe public mutations (profiles, portfolioSections, educationEntries)

Sprint 4 — Analytics & SEO             [❌ NOT STARTED]
  Profile view tracking
  Open Graph / Twitter meta tags
  Sitemap generation
  Link-in-bio analytics

Sprint 5 — Settings & Polish           [❌ NOT STARTED]
  Account deletion flow
  Theme customization
  Loading skeletons across all pages
  Error boundaries
  Missing shadcn/ui components (Dialog, Tabs, Select, Skeleton)
```

---

## 10. Architecture Notes

### Authentication Flow

```
User signs up via Clerk
    ↓
Clerk webhook fires → POST /api/webhooks/clerk
    ↓
svix verifies signature → convex/http.ts /clerk-webhook
    ↓
users.upsertFromClerk creates/updates Convex user
    ↓
ConvexUserSync (client-side fallback) also calls users.upsertSelf
    ↓
User → /dashboard/onboarding (first visit)
```

### Resume Parsing Flow

```
User uploads PDF → dashboard/upload
    ↓
resumes.generateUploadUrl → Convex file storage
    ↓
resumes.create (status: "pending")
    ↓
resumes.startParse → triggers resumeParser.parseResume (internalAction)
    ↓
Claude AI with PDF document API → structured JSON
    ↓
portfolios.ensureDefaultInternal
    ↓
portfolioSections.createInternal (one per job)
educationEntries.createInternal (one per education)
    ↓
resumes.setParseStatus → "done"
```

### Stripe Billing Flow

```
User clicks "Upgrade to Pro" on settings page
    ↓
stripeActions.createCheckoutSession (Convex action)
    ↓
Stripe Checkout hosted page (30-day trial)
    ↓
User completes payment
    ↓
Stripe webhook → POST /api/stripe/webhook
    ↓
stripe.webhooks.constructEvent (signature verification)
    ↓
Forward to Convex HTTP endpoint /stripe-webhook
    ↓
stripeActions.handleWebhookEvent (internalAction)
    ↓
subscriptions.upsertFromStripe / updateFromStripe / delete
```

### Security Patterns

- **Auth-aware mutations**: All client-facing mutations use `ctx.auth.getUserIdentity()` to verify the caller.
- **Internal mutations**: Unsafe operations (create, update, delete without auth) use `internalMutation` / `internalAction` — only callable from other Convex functions, never from the client.
- **Webhook verification**: Clerk uses svix, Stripe uses `stripe.webhooks.constructEvent`.
- **Route protection**: `src/proxy.ts` uses Clerk's `clerkMiddleware` with `auth.protect()` for non-public routes.

### Convex Patterns

- **`"use node"` files** can ONLY export `action` and `internalAction` — NOT queries or mutations. Extract queries to separate files (e.g., `stripeHelpers.ts`).
- **Lazy SDK initialization**: Stripe SDK cannot be initialized at module level in Convex (fails during analysis phase). Use a `getStripe()` function pattern instead.
- **Identity lookups**: Use `identity.subject` (not `identity.tokenIdentifier`) to match Clerk IDs stored in the users table.
- **Stripe v22 API version**: `"2026-03-25.dahlia"`. Property `current_period_end` lives on `SubscriptionItem` (not `Subscription`). Access via `subscription.items.data[0]?.current_period_end`.

---

## 11. Deployment

### Vercel

1. Connect GitHub repo to [Vercel](https://vercel.com).
2. Set all environment variables in Vercel dashboard.
3. Deploy — Vercel auto-detects Next.js 16.

### Convex

```bash
npx convex deploy     # Production deployment
npx convex dev        # Development (watches for changes)
```

### Webhook Setup

**Clerk webhook**:
- URL: `https://your-domain.vercel.app/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

**Stripe webhook**:
- URL: `https://your-domain.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## 12. Commands Reference

```bash
# Development
npm run dev                  # Start Next.js dev server (http://localhost:3000)
npx convex dev               # Start Convex dev server (watches schema + functions)

# Build & Deploy
npm run build                # Production Next.js build
npx next build               # Same as above
npx convex deploy            # Deploy Convex to production

# Validation
npx convex dev --once        # One-shot Convex deploy (CI/CD)
npm run lint                 # ESLint

# Convex Utilities
npx convex dashboard         # Open Convex dashboard in browser
npx convex env set KEY=VAL   # Set Convex environment variable
npx convex logs              # View Convex function logs
```
# mivitae — Living Portfolio Platform
### Development Specification & Continuation Guide

> **mi vitae** (/miː ˈvɪtaɪ/) — Latin: "my life"
>
> A SaaS platform where anyone uploads a résumé and receives an auto-generated,
> living portfolio: verified work history, education timeline, and industry-specific
> interactive demo cards — all publicly shareable at `mivitae.io/u/[slug]`.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Tech Stack](#2-tech-stack)
3. [Repository Layout](#3-repository-layout)
4. [Environment Variables](#4-environment-variables)
5. [Data Model (Convex Schema)](#5-data-model-convex-schema)
6. [Application Routes](#6-application-routes)
7. [Build Status & Known Issues](#7-build-status--known-issues)
8. [Phase Roadmap](#8-phase-roadmap)
9. [Phase 1 — Foundation (In Progress)](#9-phase-1--foundation-in-progress)
10. [Phase 2 — Onboarding Wizard](#10-phase-2--onboarding-wizard)
11. [Phase 3 — Resume Parsing & AI Generation](#11-phase-3--resume-parsing--ai-generation)
12. [Phase 4 — Public Portfolio (`/u/[slug]`)](#12-phase-4--public-portfolio-uslug)
13. [Phase 5 — Interactive Demo Cards](#13-phase-5--interactive-demo-cards)
14. [Phase 6 — Subscription & Billing (Stripe)](#14-phase-6--subscription--billing-stripe)
15. [Phase 7 — Analytics & SEO](#15-phase-7--analytics--seo)
16. [Deployment (Vercel)](#16-deployment-vercel)
17. [Commands Reference](#17-commands-reference)

---

## 1. Product Vision

mivitae transforms a static résumé document into a dynamic, shareable, living portfolio.
The core user journey is:

```
Upload résumé (PDF/DOCX)
        ↓
AI extracts: work history, education, skills, projects
        ↓
User reviews & enriches each section via a guided wizard
        ↓
Platform generates a beautiful public profile at /u/[slug]
        ↓
Each job entry / education entry links to interactive demo cards
(live coding sandboxes, architecture diagrams, case study write-ups)
        ↓
User shares profile link • Employers / clients visit • Everyone impressed
```

### Business Model

| Tier | Price | Features |
|------|-------|---------|
| Free (30-day trial) | $0 | Full feature access, 1 portfolio, 3 demo cards |
| Pro | $12/month | Unlimited portfolios, unlimited demos, custom slug, analytics |
| Team | $49/month | 5 seats, shared demo library, white-label subdomain |

Payments: Stripe Subscriptions with Stripe Customer Portal for self-service management.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 16.2.4 |
| Language | TypeScript | ^5 |
| UI Primitives | shadcn/ui (Radix + cva) | 4.2.0 |
| Styling | Tailwind CSS | ^4 |
| Icons | lucide-react | ^1.8.0 |
| Database / Backend | Convex (serverless, realtime) | 1.35.1 |
| Authentication | Clerk | 7.2.1 |
| Payments | Stripe | 22.0.1 |
| PDF Parsing | pdf-parse | 2.4.5 |
| Webhook Verification | svix (Clerk), stripe | built-in |
| Deployment | Vercel | — |
| Package Manager | npm | — |

### Architecture decision: Why Convex?

Convex was chosen over Supabase/Prisma/PlanetScale for three reasons:
1. **Realtime by default** — no polling, WebSocket subscriptions out of the box.
2. **Functions-as-backend** — queries, mutations, and actions run server-side in a type-safe environment, no separate API layer needed.
3. **No SQL migrations** — schema changes deploy automatically from `convex/schema.ts`.

---

## 3. Repository Layout

```
mivitae/
│
├── convex/                     # Convex backend functions + schema
│   ├── schema.ts               # DONE — 11 tables, 16 indexes
│   ├── users.ts                # DONE — Clerk webhook user sync
│   ├── profiles.ts             # DONE — profile CRUD (get, update, slug lookup)
│   ├── resumes.ts              # DONE — resume upload + parse mutations
│   ├── onboarding.ts           # DONE — wizard state management
│   ├── http.ts                 # DONE — HTTP router (Clerk + Stripe webhooks)
│   ├── portfolios.ts           # TODO — portfolio + section CRUD
│   ├── education.ts            # TODO — education entry CRUD
│   ├── demos.ts                # TODO — demo card CRUD + template management
│   ├── subscriptions.ts        # TODO — Stripe subscription sync
│   └── _generated/             # AUTO — never edit manually
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # DONE — root layout with Providers
│   │   ├── globals.css         # DONE — Tailwind base styles
│   │   │
│   │   ├── (marketing)/        # Public routes (no auth required)
│   │   │   ├── layout.tsx      # DONE — nav + footer shell
│   │   │   └── page.tsx        # DONE — landing page (hero, features, pricing)
│   │   │
│   │   ├── (auth)/             # Clerk-hosted auth UI
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx   # DONE
│   │   │   └── sign-up/[[...sign-up]]/page.tsx   # DONE
│   │   │
│   │   ├── (dashboard)/        # Protected — requires signed-in Clerk session
│   │   │   ├── layout.tsx      # DONE — sidebar + topbar shell
│   │   │   └── dashboard/
│   │   │       ├── page.tsx          # DONE (has Button asChild build error — see §7)
│   │   │       ├── upload/           # TODO — resume upload step
│   │   │       ├── onboarding/       # TODO — 6-step wizard
│   │   │       ├── portfolio/        # DONE (stub) — portfolio editor
│   │   │       ├── education/        # DONE (stub) — education editor
│   │   │       ├── demos/            # DONE (stub) — demo card editor
│   │   │       ├── profile/          # TODO — profile settings
│   │   │       ├── settings/         # TODO — account settings
│   │   │       └── billing/          # DONE (stub) — Stripe billing portal
│   │   │
│   │   ├── u/[slug]/           # TODO — public profile page
│   │   │
│   │   └── api/
│   │       ├── clerk/webhook/route.ts   # DONE — syncs Clerk users → Convex
│   │       └── stripe/webhook/route.ts  # TODO — syncs Stripe events → Convex
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui generated components (Button, Card, etc.)
│   │   └── providers.tsx       # DONE — ClerkProvider + ConvexProvider wrapper
│   │
│   ├── lib/
│   │   ├── convex.ts           # DONE — barrel re-export of convex/_generated/api
│   │   └── utils.ts            # DONE — cn() helper (clsx + tailwind-merge)
│   │
│   └── middleware.ts           # DONE (⚠️ see §7 — deprecation warning in Next 16)
│
├── .env.local                  # DONE (placeholders — fill in real keys)
├── components.json             # DONE — shadcn/ui config
├── next.config.ts              # DONE — Next.js config
├── tsconfig.json               # DONE
└── package.json                # DONE
```

---

## 4. Environment Variables

Fill these in `.env.local` before running locally. All are required.

```bash
# ── Convex ──────────────────────────────────────────────────────────────
# Get from: https://dashboard.convex.dev → your project → Settings → URL
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud

# ── Clerk ───────────────────────────────────────────────────────────────
# Get from: https://dashboard.clerk.com → your app → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Webhook secret — set after creating webhook endpoint in Clerk dashboard
# Endpoint URL: https://your-domain.vercel.app/api/clerk/webhook
# Events to subscribe: user.created, user.updated, user.deleted
CLERK_WEBHOOK_SECRET=whsec_...

# ── Stripe ──────────────────────────────────────────────────────────────
# Get from: https://dashboard.stripe.com → Developers → API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Webhook secret — set after creating webhook in Stripe dashboard
# Endpoint URL: https://your-domain.vercel.app/api/stripe/webhook
# Events: checkout.session.completed, customer.subscription.*
STRIPE_WEBHOOK_SECRET=whsec_...

# ── OpenAI ──────────────────────────────────────────────────────────────
# Used for resume parsing + portfolio generation
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# ── Clerk redirect URLs ─────────────────────────────────────────────────
# These tell Clerk where to send users after sign-in/out
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/onboarding
```

**For Vercel deployment**: add all the above to your Vercel project's Environment Variables
in the Vercel dashboard (Settings → Environment Variables). Never commit `.env.local`.

---

## 5. Data Model (Convex Schema)

All tables are defined in `convex/schema.ts`. The schema is already pushed to Convex.

### `users`
Mirrors Clerk user records. Synced via webhook on `user.created` / `user.updated`.

| Field | Type | Notes |
|-------|------|-------|
| clerkId | string | Clerk user ID — unique index |
| email | string | Primary email |
| firstName | string? | |
| lastName | string? | |
| imageUrl | string? | Clerk profile picture |
| createdAt | number | Unix timestamp |

### `profiles`
The public-facing identity for each user.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | FK → users — unique index |
| slug | string | URL slug — e.g. `john-doe-42` — unique index |
| headline | string? | "Senior Engineer @ Stripe" |
| bio | string? | 3–5 sentence professional summary |
| location | string? | "San Francisco, CA" |
| websiteUrl | string? | Personal site |
| linkedinUrl | string? | |
| githubUrl | string? | |
| isPublic | boolean | Whether /u/[slug] is publicly visible |
| avatarUrl | string? | Overrides Clerk image if set |
| theme | string? | Future: portfolio color theme |

### `resumes`
Uploaded résumé documents.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | Index: by_user |
| fileName | string | Original filename |
| storageId | string | Convex file storage ID |
| parsedText | string? | Raw text extracted from PDF |
| parseStatus | string | "pending" \| "processing" \| "done" \| "error" |
| uploadedAt | number | Unix timestamp |

### `portfolios`
One portfolio per user (extensible to multiple in future).

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | Index: by_user |
| profileId | Id<"profiles"> | |
| title | string | Portfolio display name |
| isDefault | boolean | Whether this is the primary portfolio |
| createdAt | number | |
| updatedAt | number | |

### `portfolioSections`
Individual work experience entries within a portfolio.

| Field | Type | Notes |
|-------|------|-------|
| portfolioId | Id<"portfolios"> | Index: by_portfolio |
| userId | Id<"users"> | |
| companyName | string | "Stripe", "Google", etc. |
| role | string | "Senior Software Engineer" |
| startDate | string | "2021-03" (YYYY-MM) |
| endDate | string? | null = current role |
| description | string | AI-generated or user-written summary |
| skills | string[] | Tag list |
| achievements | string[] | Bullet points |
| order | number | Display order (drag-to-reorder) |
| demoIds | Id<"userDemos">[] | Linked demo cards |

### `educationEntries`
Education history entries.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | Index: by_user |
| portfolioId | Id<"portfolios"> | |
| institution | string | "MIT", "Stanford", etc. |
| degree | string | "B.S. Computer Science" |
| fieldOfStudy | string? | |
| startYear | number | |
| endYear | number? | null = in progress |
| gpa | string? | Optional |
| honors | string? | "Summa Cum Laude" |
| activities | string[] | Clubs, sports, orgs |
| order | number | Display order |

### `demoTemplates`
System-defined reusable demo blueprints (seeded by admin).

| Field | Type | Notes |
|-------|------|-------|
| name | string | "REST API Design", "ML Pipeline" |
| category | string | "backend", "ml", "frontend", "data", "devops" |
| description | string | What this demo shows |
| thumbnailUrl | string? | |
| defaultContent | string | JSON config / starter code |
| isActive | boolean | |

### `userDemos`
A user's instantiated demo card, based on a template.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | Index: by_user |
| templateId | Id<"demoTemplates"> | |
| title | string | User-customized title |
| description | string | Context for this specific demo |
| content | string | JSON — template-specific payload |
| isPublic | boolean | Visible on public portfolio |
| createdAt | number | |

### `subscriptions`
Stripe subscription record, synced via webhook.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | Index: by_user + by_stripe_id |
| stripeCustomerId | string | Stripe `cus_...` |
| stripeSubscriptionId | string | Stripe `sub_...` |
| status | string | "active", "trialing", "canceled", "past_due" |
| plan | string | "free", "pro", "team" |
| currentPeriodEnd | number | Unix timestamp |
| cancelAtPeriodEnd | boolean | |

### `onboardingState`
Tracks which step of the onboarding wizard a new user is on.

| Field | Type | Notes |
|-------|------|-------|
| userId | Id<"users"> | Index: by_user (unique) |
| currentStep | number | 0–5 |
| completedSteps | number[] | [0, 1, 2, ...] |
| resumeId | Id<"resumes">? | Set after upload |
| isComplete | boolean | Redirect to dashboard when true |

### `demoEmbeddings`
Vector embeddings for demo content (future: semantic search / AI recommendations).

| Field | Type | Notes |
|-------|------|-------|
| demoId | Id<"userDemos"> | |
| embedding | number[] | 1536-dim (text-embedding-3-small) |
| textChunk | string | Source text chunk |

---

## 6. Application Routes

### Public Routes (no auth)

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `(marketing)/page.tsx` | Landing page |
| `/sign-in` | `(auth)/sign-in/page.tsx` | Clerk-hosted sign-in UI |
| `/sign-up` | `(auth)/sign-up/page.tsx` | Clerk-hosted sign-up UI |
| `/u/[slug]` | `app/u/[slug]/page.tsx` | Public portfolio (TODO) |

### Protected Routes (requires Clerk session)

| Path | Component | Notes |
|------|-----------|-------|
| `/dashboard` | `dashboard/page.tsx` | Home — shows resume status + quick actions |
| `/dashboard/upload` | `dashboard/upload/page.tsx` | Resume upload + parse trigger |
| `/dashboard/onboarding` | `dashboard/onboarding/page.tsx` | 6-step guided wizard |
| `/dashboard/portfolio` | `dashboard/portfolio/page.tsx` | Work history editor |
| `/dashboard/education` | `dashboard/education/page.tsx` | Education editor |
| `/dashboard/demos` | `dashboard/demos/page.tsx` | Demo card manager |
| `/dashboard/profile` | `dashboard/profile/page.tsx` | Public profile settings |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | Account + preferences |
| `/dashboard/billing` | `dashboard/billing/page.tsx` | Stripe portal + plan info |

### API Routes

| Path | Method | Purpose |
|------|--------|---------|
| `/api/clerk/webhook` | POST | Clerk → Convex user sync |
| `/api/stripe/webhook` | POST | Stripe → Convex subscription sync |

---

## 7. Build Status & Known Issues

### Current State: ❌ TypeScript build fails

Run `npx next build` from `C:\Users\Kieth\Documents\Repositories\thenumerix\mivitae`.

**Error 1 — `Button asChild` prop missing** (highest priority)

File: `src/app/(dashboard)/dashboard/page.tsx`, line ~115

```
Type error: Type '{ children: Element; className: string; asChild: true; }' is not
assignable to type 'IntrinsicAttributes & ButtonProps...'
Property 'asChild' does not exist on type '...'
```

**Root cause:** The shadcn/ui `Button` component uses `class-variance-authority` but was
generated without `@radix-ui/react-slot`, so the `asChild` prop is not wired up.

**Fix — Option A (quick):** Replace `<Button asChild><Link href="...">...</Link></Button>`
with a plain Tailwind-styled link that looks like a button:

```tsx
// Before (broken):
<Button className="mt-4" asChild>
  <Link href="/dashboard/upload">
    Upload Resume <ArrowRight className="ml-2 h-4 w-4" />
  </Link>
</Button>

// After (fix):
<Link
  href="/dashboard/upload"
  className="inline-flex items-center mt-4 rounded-md bg-primary px-4 py-2 
             text-sm font-medium text-primary-foreground hover:bg-primary/90 
             transition-colors"
>
  Upload Resume <ArrowRight className="ml-2 h-4 w-4" />
</Link>
```

**Fix — Option B (canonical shadcn/ui):** Update the Button component to use Slot:

```bash
npm install @radix-ui/react-slot
```

Then in `src/components/ui/button.tsx`, add:

```tsx
import { Slot } from "@radix-ui/react-slot"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
```

Option B is preferred if `asChild` is used in more than one place.

---

**Error 2 — Broken import paths** (may be resolved, verify)

Files: `dashboard/education/page.tsx`, `dashboard/portfolio/page.tsx`

```
Module not found: Can't resolve '../../../../../convex/_generated/api'
```

**Fix:** Change the import to use the barrel re-export:

```tsx
// Before (broken):
import { api } from "../../../../../convex/_generated/api"

// After (correct):
import { api } from "@/lib/convex"
```

`src/lib/convex.ts` already exists with:
```ts
export { api } from "../../convex/_generated/api"
```

---

**Warning — Next.js 16 middleware deprecation**

File: `src/middleware.ts`

Next.js 16 renamed `middleware.ts` to `middleware.ts` but changed the export API slightly.
If you see a deprecation warning about `authMiddleware`, the modern Clerk approach is:

```ts
// src/middleware.ts — modern Clerk v6+ style
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/u/(.*)',
  '/api/clerk/webhook',
  '/api/stripe/webhook',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

---

### After fixing errors — verify with:

```powershell
cd C:\Users\Kieth\Documents\Repositories\thenumerix\mivitae
npx next build
```

Expected output: `✓ Compiled successfully` with **0 TypeScript errors**.

---

## 8. Phase Roadmap

```
Phase 1 — Foundation          [~80% complete]
  ✅ Next.js 16 + TypeScript scaffold
  ✅ Tailwind CSS 4 + shadcn/ui
  ✅ Convex schema (11 tables, 16 indexes) pushed
  ✅ Clerk auth (sign-in, sign-up, webhook sync)
  ✅ Marketing landing page
  ✅ Dashboard shell (sidebar layout)
  ❌ Build errors (Button asChild, import paths)
  ❌ Middleware update

Phase 2 — Onboarding Wizard   [not started]
  6-step guided flow: profile → upload → parse review → portfolio → education → publish

Phase 3 — Resume Parsing & AI [not started]
  pdf-parse → OpenAI GPT-4o → structured JSON → Convex mutations

Phase 4 — Public Portfolio    [not started]
  /u/[slug] — server-rendered, shareable, SEO-optimized

Phase 5 — Demo Cards          [not started]
  Template library → interactive sandboxes + case studies

Phase 6 — Stripe Billing      [not started]
  Subscription management, trial enforcement, upgrade flow

Phase 7 — Analytics & SEO    [not started]
  Profile view tracking, link-in-bio analytics, Open Graph meta
```

---

## 9. Phase 1 — Foundation (In Progress)

### Immediate next steps (to close out Phase 1):

**Step 1 — Fix `Button asChild` error**

Open `src/app/(dashboard)/dashboard/page.tsx`.
Find all instances of `<Button asChild>` and apply the Option A or Option B fix from §7.

**Step 2 — Verify import paths in education and portfolio pages**

Open each file and confirm the import reads:
```tsx
import { api } from "@/lib/convex"
```
Not the deep relative path. If it still uses the relative path, fix it.

Files to check:
- `src/app/(dashboard)/dashboard/education/page.tsx`
- `src/app/(dashboard)/dashboard/portfolio/page.tsx`

**Step 3 — Update middleware**

Replace the body of `src/middleware.ts` with the modern Clerk v6 pattern from §7.

**Step 4 — Run build**

```powershell
npx next build
```

**Step 5 — Add real env vars**

Fill `.env.local` with actual keys from:
- Convex dashboard: https://dashboard.convex.dev
- Clerk dashboard: https://dashboard.clerk.com
- Stripe dashboard: https://dashboard.stripe.com
- OpenAI platform: https://platform.openai.com/api-keys

**Step 6 — Start dev server**

```powershell
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Convex (keeps schema in sync + runs server functions)
npx convex dev
```

Visit http://localhost:3000 and confirm:
- Landing page renders
- Sign-up creates a Clerk user
- Clerk webhook fires → user appears in Convex `users` table
- Dashboard is accessible after sign-in
- Dashboard redirects to sign-in if not authenticated

---

## 10. Phase 2 — Onboarding Wizard

A 6-step guided flow shown to every new user after sign-up.

Route: `/dashboard/onboarding`

State stored in Convex `onboardingState` table, keyed by `userId`.

### Steps

| Step | Route Segment | Title | What Happens |
|------|--------------|-------|-------------|
| 0 | `?step=profile` | Complete Your Profile | User sets name, headline, bio, location, LinkedIn, GitHub |
| 1 | `?step=upload` | Upload Your Résumé | PDF/DOCX upload → stored in Convex file storage → parse job queued |
| 2 | `?step=review` | Review Parsed Data | AI-extracted data shown side-by-side with resume; user corrects errors |
| 3 | `?step=portfolio` | Build Your Timeline | Work history editor — add/edit/reorder job entries |
| 4 | `?step=education` | Add Education | Education card editor |
| 5 | `?step=publish` | Go Live! | Choose slug, preview public profile, click Publish |

### Implementation Notes

- Wizard progress is persisted in Convex — refreshing the page resumes at the correct step.
- `onboardingState.completedSteps` is an array of step indices so users can jump back.
- A stepper UI component at the top shows progress (use shadcn/ui `Steps` or build custom).
- After step 5, set `onboardingState.isComplete = true` and redirect to `/dashboard`.
- If `onboardingState.isComplete` is already `true`, redirect `/dashboard/onboarding` → `/dashboard`.

### Convex mutations needed (in `convex/onboarding.ts`):

```ts
// Already created — functions to add:
export const updateStep = mutation(...)       // advance or go back
export const markStepComplete = mutation(...) // mark individual step done
export const getState = query(...)            // get current wizard state
export const resetWizard = mutation(...)      // dev/admin only
```

---

## 11. Phase 3 — Resume Parsing & AI Generation

This is the core AI feature. Flow:

```
1. User uploads PDF in onboarding step 1
2. Convex action stores file in Convex file storage, creates `resumes` record with status="pending"
3. A Convex action (called from mutation) triggers the parse pipeline:
   a. Fetch file from storage as ArrayBuffer
   b. Pass buffer to pdf-parse → extract raw text
   c. Send text to OpenAI GPT-4o with a structured extraction prompt
   d. Parse JSON response → validate schema
   e. Upsert extracted data into portfolioSections + educationEntries
   f. Update resume status to "done"
4. Dashboard polls resume status (Convex reactive query — auto-updates)
5. When status = "done", redirect to onboarding step 2 (review)
```

### OpenAI prompt (draft — in `convex/resumes.ts`):

```
You are an expert résumé parser. Extract structured data from the following résumé text.
Return ONLY valid JSON matching this schema exactly:

{
  "workHistory": [{
    "companyName": string,
    "role": string,
    "startDate": "YYYY-MM",
    "endDate": "YYYY-MM | null",
    "description": string (2-3 sentence summary),
    "skills": string[],
    "achievements": string[] (max 5 bullet points)
  }],
  "education": [{
    "institution": string,
    "degree": string,
    "fieldOfStudy": string | null,
    "startYear": number,
    "endYear": number | null,
    "honors": string | null
  }],
  "skills": string[],
  "summary": string (3-5 sentence professional bio)
}

Résumé text:
{{resumeText}}
```

### Model choice:
- Use `gpt-4o` for accuracy on complex résumés.
- Use `gpt-4o-mini` for cost optimization on high-volume users (adjust in env var).

### Error handling:
- Parse failures: set `resume.parseStatus = "error"`, surface error message in UI.
- Malformed JSON: retry once with a more constrained prompt.
- Timeout: Convex actions have a 10-minute timeout — PDF parsing + OpenAI call fits comfortably.

---

## 12. Phase 4 — Public Portfolio (`/u/[slug]`)

This is the shareable end product — the page users send to employers and clients.

Route: `src/app/u/[slug]/page.tsx`

### Layout

```
/u/john-doe
├── Hero section
│   ├── Avatar (from Clerk or custom upload)
│   ├── Name + Headline
│   ├── Bio paragraph
│   ├── Location, website, LinkedIn, GitHub links
│   └── "Download PDF" button (future)
│
├── Work History section
│   └── Timeline cards (one per portfolioSection)
│       ├── Company + Role + Dates
│       ├── Description
│       ├── Skills badges
│       ├── Achievement bullets
│       └── "View Demo" buttons → linked userDemos
│
├── Education section
│   └── Education cards (one per educationEntry)
│
├── Demo Cards section
│   └── Grid of demo cards
│       ├── Thumbnail
│       ├── Title + description
│       └── "Launch Demo" → interactive content
│
└── Footer: "Built with mivitae.io"
```

### Implementation Notes:

- **Server component** — use `generateMetadata` for dynamic Open Graph tags.
- **Static generation** — use `generateStaticParams` if you want ISR for popular profiles.
- **Auth gate**: if `profile.isPublic = false`, render a "This portfolio is private" page.
- **og:image**: generate a dynamic Open Graph image with Next.js `/og?slug=john-doe` route
  using `@vercel/og` (ImageResponse) — logo + name + headline overlay on gradient background.

### SEO metadata example:

```tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const profile = await fetchProfileBySlug(params.slug) // server-side Convex query
  return {
    title: `${profile.firstName} ${profile.lastName} — ${profile.headline}`,
    description: profile.bio,
    openGraph: {
      images: [`/og?slug=${params.slug}`],
    },
  }
}
```

---

## 13. Phase 5 — Interactive Demo Cards

Demo cards are the USP of mivitae. Each card can be one of several types:

| Demo Type | Description | Implementation |
|-----------|-------------|---------------|
| `code` | Code sandbox with syntax highlighting + output | Monaco Editor + server-side exec (sandboxed) |
| `architecture` | Interactive system diagram | React Flow or Mermaid.js |
| `case-study` | Rich markdown write-up | MDX with custom components |
| `api-demo` | Live API call with response preview | Fetch from client, display JSON |
| `chart` | Data visualization | Recharts / Victory / Chart.js |
| `slideshow` | Presentation-style walkthrough | Embla Carousel |

### Template Library (seed data for `demoTemplates` table):

```
Backend / API:
  - REST API Design (code + api-demo)
  - GraphQL Schema Design (code + architecture)
  - Microservices Architecture (architecture)

Machine Learning:
  - ML Pipeline (architecture + code)
  - Model Training Dashboard (chart)
  - Feature Engineering (code)

Frontend:
  - React Component Library (code)
  - Performance Optimization (chart + case-study)

Data Engineering:
  - ETL Pipeline (architecture)
  - Streaming Architecture (architecture + chart)

DevOps:
  - CI/CD Pipeline (architecture + case-study)
  - Kubernetes Deployment (architecture)
  - IaC with Terraform (code)
```

### Content JSON schema (stored in `userDemo.content`):

```json
{
  "type": "code",
  "language": "python",
  "code": "import pandas as pd\n...",
  "description": "This demonstrates...",
  "highlights": ["line 3: data ingestion", "line 12: feature engineering"]
}
```

---

## 14. Phase 6 — Subscription & Billing (Stripe)

### Stripe Products to Create (in Stripe Dashboard):

```
Product: mivitae Pro
  Price: $12.00/month (recurring)
  Price ID: price_... (add to env var STRIPE_PRO_PRICE_ID)

Product: mivitae Team
  Price: $49.00/month (recurring)
  Price ID: price_... (add to env var STRIPE_TEAM_PRICE_ID)
```

### Trial Logic:

- All new users get 30 days free (Stripe trial period on checkout).
- On trial: full Pro features enabled.
- After trial with no subscription: downgrade to Free tier limits (1 portfolio, 3 demos).
- Check trial status: `subscription.status === "trialing"`.

### Checkout Flow:

```
User clicks "Upgrade to Pro" in /dashboard/billing
  ↓
POST /api/stripe/create-checkout (Convex HTTP action OR Next.js API route)
  ↓
Stripe Checkout Session created with:
  - customer_email: user's email
  - line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }]
  - mode: "subscription"
  - trial_period_days: 30 (if first subscription ever)
  - success_url: /dashboard/billing?success=true
  - cancel_url: /dashboard/billing
  ↓
Redirect to Stripe-hosted checkout page
  ↓
User completes payment
  ↓
Stripe fires checkout.session.completed webhook
  ↓
/api/stripe/webhook → updates Convex subscriptions table
  ↓
Dashboard reflects Pro status
```

### Stripe Customer Portal:

For cancellations, plan changes, payment method updates:

```ts
// In a Convex HTTP action or Next.js route:
const session = await stripe.billingPortal.sessions.create({
  customer: subscription.stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
})
// Redirect user to session.url
```

---

## 15. Phase 7 — Analytics & SEO

### Profile View Tracking:

- Log a view event whenever `/u/[slug]` is visited (excluding the owner).
- Store events in a `profileViews` Convex table:
  ```
  { profileId, viewerIp (hashed), referrer, timestamp }
  ```
- Dashboard analytics tab: views over time chart, top referrers, geography (if available).

### Link-in-Bio Analytics:

- Track clicks on LinkedIn, GitHub, website links using a redirect route:
  `/u/[slug]/out?link=linkedin` → log click → redirect to actual URL.

### Open Graph Image:

Route: `src/app/og/route.tsx` using `@vercel/og`:

```tsx
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  // fetch profile...
  return new ImageResponse(
    <div style={{ /* gradient background */ }}>
      <img src={avatarUrl} />
      <h1>{firstName} {lastName}</h1>
      <p>{headline}</p>
      <p>mivitae.io/u/{slug}</p>
    </div>,
    { width: 1200, height: 630 }
  )
}
```

---

## 16. Deployment (Vercel)

### Setup:

1. Push repo to GitHub (create `thenumerix/mivitae` repo).
2. Import project in Vercel dashboard.
3. Add all environment variables from §4.
4. Set Framework Preset to **Next.js**.
5. Deploy.

### Convex deployment:

```powershell
# Deploy Convex functions to production
npx convex deploy --cmd "npm run build"
```

In Vercel, set `CONVEX_DEPLOY_KEY` environment variable using the key from the Convex dashboard
(Settings → Deploy Keys → Generate New).

### Production Clerk webhook:

After Vercel deployment:
1. Go to clerk.com → your app → Webhooks → Add Endpoint
2. URL: `https://mivitae.io/api/clerk/webhook`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret → add as `CLERK_WEBHOOK_SECRET` in Vercel env vars

### Production Stripe webhook:

1. Go to dashboard.stripe.com → Developers → Webhooks → Add Endpoint
2. URL: `https://mivitae.io/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel env vars

### Domain:

1. Buy `mivitae.io` on Namecheap / Cloudflare.
2. In Vercel: Settings → Domains → Add `mivitae.io`.
3. Add the DNS records Vercel provides to your registrar.

---

## 17. Commands Reference

```powershell
# Navigate to project
cd C:\Users\Kieth\Documents\Repositories\thenumerix\mivitae

# ── Development ──────────────────────────────────────────────────────────
# Start Next.js dev server (port 3000)
npm run dev

# Start Convex dev server (watches schema + functions, hot-reloads)
npx convex dev

# ── Building ─────────────────────────────────────────────────────────────
# Type-check + build (must pass before deploy)
npx next build

# ── Convex ───────────────────────────────────────────────────────────────
# Push schema + functions to Convex (one-time, no watch)
npx convex dev --once

# Deploy Convex to production
npx convex deploy

# Open Convex dashboard
npx convex dashboard

# ── shadcn/ui ────────────────────────────────────────────────────────────
# Add a new shadcn/ui component
npx shadcn@latest add <component-name>
# e.g.:
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add progress
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add separator

# ── Stripe (local webhook testing) ───────────────────────────────────────
# Install Stripe CLI (one-time)
# Download from: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# ── Git ──────────────────────────────────────────────────────────────────
git add .
git commit -m "feat: <description>"
git push origin main
# ↑ triggers Vercel auto-deploy
```

---

*This document was generated on 2026-04-15. It represents the full planned scope of mivitae.
Phase 1 is ~80% complete. Continue from §9 (Phase 1 completion steps) in a fresh editor session.*
