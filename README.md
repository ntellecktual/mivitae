# mivitae — Living Portfolio Platform

> **mi vitae** (/miː ˈvɪtaɪ/) — Latin: "my life"

A SaaS platform where anyone uploads a résumé and receives an auto-generated, living portfolio: verified work history, education timeline, and industry-specific interactive demo cards — all publicly shareable at `mivitae.org/u/[slug]`.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | [Next.js](https://nextjs.org) App Router | 16.2.4 |
| Language | TypeScript | ^5 |
| UI | [shadcn/ui](https://ui.shadcn.com) (Base UI + cva) | 4.2.0 |
| Styling | [Tailwind CSS](https://tailwindcss.com) | ^4 |
| Icons | [Lucide React](https://lucide.dev) | ^1.8.0 |
| Backend | [Convex](https://convex.dev) (serverless, realtime) | 1.35.1 |
| Auth | [Clerk](https://clerk.com) | 7.2.1 |
| Payments | [Stripe](https://stripe.com) | 22.0.1 |
| AI | [Anthropic Claude](https://anthropic.com) | ^0.89.0 |
| PDF Parsing | pdf-parse | 2.4.5 |
| Deployment | [Vercel](https://vercel.com) | — |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- Accounts: [Convex](https://dashboard.convex.dev), [Clerk](https://dashboard.clerk.com), [Stripe](https://dashboard.stripe.com), [Anthropic](https://console.anthropic.com)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` or create `.env.local` with:

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

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (also set in Convex dashboard)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=price_...

# Anthropic (for resume parsing)
ANTHROPIC_API_KEY=sk-ant-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Also set these in your **Convex dashboard** (Environment Variables):
- `STRIPE_SECRET_KEY`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_TEAM_PRICE_ID`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### 3. Run development servers

```bash
# Terminal 1 — Convex backend (keeps schema synced + runs server functions)
npx convex dev

# Terminal 2 — Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Verify build

```bash
npx next build
```

---

## Project Structure

```
mivitae/
├── convex/                     # Convex backend (schema, queries, mutations, actions)
│   ├── schema.ts               # 11 tables, 16+ indexes
│   ├── auth.config.ts          # Clerk JWT provider config
│   ├── http.ts                 # HTTP routes (Clerk + Stripe webhooks)
│   ├── users.ts                # User CRUD (Clerk sync)
│   ├── profiles.ts             # Profile CRUD (slug lookup, public profiles)
│   ├── resumes.ts              # Resume upload + parse trigger
│   ├── resumeParser.ts         # Claude AI resume extraction (internalAction)
│   ├── onboarding.ts           # Wizard state management
│   ├── portfolios.ts           # Portfolio CRUD
│   ├── portfolioSections.ts    # Work history sections (auth-aware)
│   ├── educationEntries.ts     # Education entries (auth-aware)
│   ├── demos.ts                # Demo cards + template management
│   ├── seedDemoTemplates.ts    # 14 demo templates (run-once seed)
│   ├── subscriptions.ts        # Stripe subscription sync
│   ├── stripeActions.ts        # Stripe Checkout + Portal + webhook handler
│   ├── stripeHelpers.ts        # Internal queries for Stripe actions
│   └── _generated/             # Auto-generated (never edit)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata, Providers)
│   │   ├── globals.css         # Tailwind CSS base
│   │   ├── (marketing)/        # Public landing page + header/footer
│   │   ├── sign-in/            # Clerk sign-in
│   │   ├── sign-up/            # Clerk sign-up
│   │   ├── (dashboard)/        # Protected dashboard (sidebar, all editors)
│   │   ├── u/[slug]/           # Public portfolio page
│   │   └── api/
│   │       ├── webhooks/clerk/ # Clerk webhook → Convex user sync
│   │       └── stripe/webhook/ # Stripe webhook → Convex subscription sync
│   │
│   ├── components/
│   │   ├── providers.tsx       # ClerkProvider + ConvexProvider + ConvexUserSync
│   │   └── ui/                 # 10 shadcn/ui components
│   │
│   ├── lib/
│   │   ├── convex.ts           # Barrel re-export of convex api
│   │   └── utils.ts            # cn() helper (clsx + tailwind-merge)
│   │
│   └── proxy.ts                # Clerk middleware (Next.js 16 proxy pattern)
│
├── DEVELOPMENT.md              # Full development spec & continuation guide
├── AGENTS.md                   # AI agent instructions
└── CLAUDE.md                   # Claude-specific agent config
```

---

## Features

### Implemented

- **Resume Upload & AI Parsing** — Upload PDF, Claude AI extracts work history, education, skills into structured data
- **6-Step Onboarding Wizard** — Guided flow: profile → upload → parse review → portfolio → education → publish
- **Work History Editor** — Inline editing of portfolio sections with drag-to-reorder
- **Education Editor** — Inline editing of education entries
- **Profile Editor** — Headline, bio, location, social links, theme selection
- **Demo Cards** — Template library (14 templates across 5 categories), create/edit/link to portfolio sections
- **Public Portfolio** — Shareable page at `/u/[slug]` with work history, education, and demo cards
- **Stripe Billing** — Subscription management with 3 tiers (Free/Pro/Team), Checkout, Customer Portal
- **Clerk Authentication** — Sign-up, sign-in, webhook user sync, protected routes
- **Realtime Data** — Convex subscriptions for instant UI updates across all editors

### Business Model

| Tier | Price | Features |
|------|-------|---------|
| Free Trial | $0 / 30 days | Full access, 1 portfolio, 3 demo cards |
| Pro | $12/month | Unlimited portfolios & demos, custom slug, analytics |
| Team | $49/month | 5 seats, shared demo library, white-label subdomain |

---

## Application Routes

### Public

| Path | Description |
|------|-------------|
| `/` | Marketing landing page |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/u/[slug]` | Public portfolio page |

### Protected (requires authentication)

| Path | Description |
|------|-------------|
| `/dashboard` | Overview — resume status, quick actions, onboarding banner |
| `/dashboard/upload` | Resume upload with parse tracking |
| `/dashboard/onboarding` | 6-step onboarding wizard |
| `/dashboard/portfolio` | Work history editor |
| `/dashboard/education` | Education editor |
| `/dashboard/demos` | Demo card manager (My Demos + Template Library) |
| `/dashboard/profile` | Profile settings |
| `/dashboard/settings` | Account & billing management |

### API

| Path | Method | Description |
|------|--------|-------------|
| `/api/webhooks/clerk` | POST | Clerk → Convex user sync |
| `/api/stripe/webhook` | POST | Stripe → Convex subscription sync |

---

## Deployment

### Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set all environment variables in Vercel dashboard (Settings → Environment Variables)
3. Deploy — Vercel auto-detects Next.js 16

### Convex

Convex deploys automatically when you run `npx convex dev` (development) or `npx convex deploy` (production).

### Webhook Setup

**Clerk** — Create webhook endpoint in [Clerk Dashboard](https://dashboard.clerk.com):
- URL: `https://your-domain.vercel.app/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

**Stripe** — Create webhook endpoint in [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
- URL: `https://your-domain.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Commands Reference

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npx convex dev       # Start Convex dev (watches schema + functions)
npx convex deploy    # Deploy Convex to production
```

---

## License

Private — © TheNumerix
